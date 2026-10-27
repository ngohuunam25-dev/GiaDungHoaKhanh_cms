// components/R2FileInput.tsx
import {AddCircleIcon} from '@sanity/icons/AddCircle'
import {DocumentIcon} from '@sanity/icons/Document'
import {DownloadIcon} from '@sanity/icons/Download'
import {EllipsisHorizontalIcon} from '@sanity/icons/EllipsisHorizontal'
import {ImageIcon} from '@sanity/icons/Image'
import {LaunchIcon} from '@sanity/icons/Launch'
import {PlayIcon} from '@sanity/icons/Play'
import {SparkleIcon} from '@sanity/icons/Sparkle'
import {TrashIcon} from '@sanity/icons/Trash'
import {UploadIcon} from '@sanity/icons/Upload'
import {Box, Button, Card, Flex, Spinner, Stack, Text} from '@sanity/ui'
import {Menu, MenuButton, MenuDivider, MenuItem} from '@sanity/ui/menu'
import {useToast} from '@sanity/ui/toast'
import {useCallback, useRef, useState} from 'react'
import {set, StringInputProps, unset} from 'sanity'
// ---------------------------------------------------------------------------
// Cấu hình
// ---------------------------------------------------------------------------
const MAX_SIZE_MB = 500
const ACCEPT = 'image/*,video/*,audio/*,application/pdf' // để '' nếu cho phép mọi loại file

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type FileKind = 'image' | 'video' | 'audio' | 'pdf' | 'other'

const EXT: Record<Exclude<FileKind, 'other'>, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'],
  video: ['mp4', 'webm', 'mov', 'm4v', 'ogv'],
  audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'],
  pdf: ['pdf'],
}

function getKind(url: string): FileKind {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? ''
  const found = (Object.keys(EXT) as Array<keyof typeof EXT>).find((k) => EXT[k].includes(ext))
  return found ?? 'other'
}

function getFileName(url: string): string {
  try {
    const raw = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '')
    // bỏ tiền tố timestamp do Worker thêm vào: 1730000000000-ten-file.png
    return raw.replace(/^\d{10,}-/, '') || raw
  } catch {
    return url
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

/** PUT có theo dõi tiến trình (fetch không hỗ trợ progress khi upload) */
function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
  signal: {current: XMLHttpRequest | null},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    signal.current = xhr
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload thất bại (${xhr.status})`))
    xhr.onerror = () => reject(new Error('Lỗi mạng hoặc CORS, kiểm tra cấu hình bucket R2'))
    xhr.onabort = () => reject(new Error('Đã hủy upload'))
    xhr.send(file)
  })
}

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------
function FileIconBox({kind}: {kind: FileKind}) {
  const Icon =
    kind === 'image'
      ? ImageIcon
      : kind === 'video'
        ? PlayIcon
        : kind === 'audio'
          ? SparkleIcon
          : DocumentIcon
  return (
    <Card tone="primary" radius={2} padding={3} style={{lineHeight: 0}}>
      <Text size={3}>
        <AddCircleIcon />
      </Text>
    </Card>
  )
}

function MediaPreview({url, kind}: {url: string; kind: FileKind}) {
  const [broken, setBroken] = useState(false)

  if (kind === 'image' && !broken) {
    return (
      <Card tone="transparent" style={{lineHeight: 0}}>
        <img
          src={url}
          alt=""
          onError={() => setBroken(true)}
          style={{
            width: '100%',
            maxHeight: 320,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Card>
    )
  }

  if (kind === 'video') {
    return (
      <Card tone="transparent" style={{lineHeight: 0}}>
        <video
          src={url}
          controls
          preload="metadata"
          style={{width: '100%', maxHeight: 320, display: 'block', background: '#000'}}
        />
      </Card>
    )
  }

  if (kind === 'audio') {
    return (
      <Box padding={3}>
        <audio src={url} controls preload="metadata" style={{width: '100%'}} />
      </Box>
    )
  }

  if (kind === 'pdf') {
    return (
      <Card tone="transparent" style={{lineHeight: 0}}>
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          title="Xem trước PDF"
          style={{width: '100%', height: 320, border: 0, display: 'block'}}
        />
      </Card>
    )
  }

  // File khác hoặc ảnh lỗi: chỉ hiện thẻ thông tin phía dưới
  return null
}

export function R2FileInput({value, onChange, readOnly}: StringInputProps) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string>()
  const [fileInfo, setFileInfo] = useState<{name: string; size: number}>()

  const upload = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File quá lớn (${formatSize(file.size)}). Tối đa ${MAX_SIZE_MB} MB.`)
        return
      }

      setUploading(true)
      setProgress(0)
      setError(undefined)

      try {
        const contentType = file.type || 'application/octet-stream'

        const res = await fetch(process.env.SANITY_STUDIO_R2_PRESIGN_URL!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Upload-Secret': process.env.SANITY_STUDIO_UPLOAD_SECRET!,
          },
          body: JSON.stringify({filename: file.name, contentType}),
        })
        if (!res.ok) throw new Error(`Không lấy được URL upload (${res.status})`)
        const {uploadUrl, publicUrl} = (await res.json()) as {
          uploadUrl: string
          publicUrl: string
        }

        await putWithProgress(uploadUrl, file, contentType, setProgress, xhrRef)

        setFileInfo({name: file.name, size: file.size})
        onChange(set(publicUrl))
        toast.push({status: 'success', title: 'Đã tải lên', description: file.name})
      } catch (err: any) {
        if (err?.message !== 'Đã hủy upload') setError(err?.message ?? 'Có lỗi xảy ra')
      } finally {
        setUploading(false)
        xhrRef.current = null
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [onChange, toast],
  )

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (readOnly || uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  const copyUrl = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      toast.push({status: 'success', title: 'Đã sao chép liên kết'})
    } catch {
      toast.push({status: 'error', title: 'Không thể sao chép liên kết'})
    }
  }

  const pickFile = () => inputRef.current?.click()
  const kind = value ? getKind(value) : 'other'
  const displayName = fileInfo?.name ?? (value ? getFileName(value) : '')

  return (
    <Stack gap={3}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleSelect}
        disabled={readOnly || uploading}
        style={{display: 'none'}}
      />

      {/* ---------- Đang upload ---------- */}
      {uploading && (
        <Card border radius={2} padding={4} tone="primary">
          <Stack gap={4}>
            <Flex align="center" gap={3}>
              <Spinner muted />
              <Box flex={1}>
                <Text size={1} weight="medium">
                  Đang tải lên... {progress}%
                </Text>
              </Box>
              <Button
                text="Hủy"
                mode="bleed"
                tone="critical"
                fontSize={1}
                onClick={() => xhrRef.current?.abort()}
              />
            </Flex>
            <Card radius={5} overflow="hidden" style={{height: 6}} tone="transparent" border>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'var(--card-focus-ring-color)',
                  transition: 'width 120ms linear',
                }}
              />
            </Card>
          </Stack>
        </Card>
      )}

      {/* ---------- Chưa có file: dropzone ---------- */}
      {!uploading && !value && (
        <Card
          as="button"
          type="button"
          border
          radius={2}
          padding={5}
          tone={dragging ? 'primary' : 'default'}
          onClick={pickFile}
          disabled={readOnly}
          onDragOver={(e: React.DragEvent) => {
            e.preventDefault()
            if (!readOnly) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            width: '100%',
            cursor: readOnly ? 'default' : 'pointer',
            borderStyle: 'dashed',
            textAlign: 'center',
          }}
        >
          <Flex direction="column" align="center" gap={3}>
            <Text size={4} muted>
              <UploadIcon />
            </Text>
            <Stack gap={2}>
              <Text size={1} weight="medium">
                {dragging ? 'Thả file để tải lên' : 'Kéo thả file vào đây hoặc bấm để chọn'}
              </Text>
              <Text size={0} muted>
                Tối đa {MAX_SIZE_MB} MB
              </Text>
            </Stack>
          </Flex>
        </Card>
      )}

      {/* ---------- Đã có file: preview ---------- */}
      {!uploading && value && (
        <Card
          border
          radius={2}
          overflow="hidden"
          onDragOver={(e: React.DragEvent) => {
            e.preventDefault()
            if (!readOnly) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          tone={dragging ? 'primary' : 'default'}
        >
          <MediaPreview url={value} kind={kind} />

          <Card borderTop padding={3} tone="inherit">
            <Flex align="center" gap={3}>
              {(kind === 'other' || kind === 'pdf') && <FileIconBox kind={kind} />}
              <Box flex={1} style={{minWidth: 0}}>
                <Stack gap={2}>
                  <Text size={1} weight="medium" textOverflow="ellipsis">
                    {displayName}
                  </Text>
                  <Text size={0} muted textOverflow="ellipsis">
                    {fileInfo ? `${formatSize(fileInfo.size)} · ` : ''}
                    {new URL(value).hostname}
                  </Text>
                </Stack>
              </Box>

              <MenuButton
                id="r2-file-actions"
                button={
                  <Button
                    icon={EllipsisHorizontalIcon}
                    mode="bleed"
                    padding={2}
                    aria-label="Tùy chọn file"
                  />
                }
                popover={{portal: true, placement: 'bottom-end'}}
                menu={
                  <Menu>
                    <MenuItem
                      as="a"
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      icon={LaunchIcon}
                      text="Mở trong tab mới"
                    />
                    <MenuItem
                      as="a"
                      href={value}
                      download
                      target="_blank"
                      rel="noreferrer"
                      icon={DownloadIcon}
                      text="Tải về"
                    />
                    <MenuItem icon={DocumentIcon} text="Sao chép liên kết" onClick={copyUrl} />
                    {!readOnly && (
                      <>
                        <MenuDivider />
                        <MenuItem icon={UploadIcon} text="Thay file khác" onClick={pickFile} />
                        <MenuItem
                          icon={TrashIcon}
                          text="Xóa"
                          tone="critical"
                          onClick={() => {
                            setFileInfo(undefined)
                            onChange(unset())
                          }}
                        />
                      </>
                    )}
                  </Menu>
                }
              />
            </Flex>
          </Card>
        </Card>
      )}

      {/* ---------- Lỗi ---------- */}
      {error && (
        <Card tone="critical" border radius={2} padding={3}>
          <Text size={1}>{error}</Text>
        </Card>
      )}
    </Stack>
  )
}

// // components/R2FileInput.tsx
// import {Button, Card, Stack, Text} from '@sanity/ui'
// import {useState} from 'react'
// import {set, StringInputProps, unset} from 'sanity'

// export function R2FileInput(props: StringInputProps) {
//   const {value, onChange} = props
//   const [uploading, setUploading] = useState(false)
//   const [error, setError] = useState<string>()

//   const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return
//     setUploading(true)
//     setError(undefined)
//     try {
//       const res = await fetch(process.env.SANITY_STUDIO_R2_API_URL!, {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({filename: file.name, contentType: file.type}),
//       })
//       const {uploadUrl, publicUrl} = await res.json()

//       const put = await fetch(uploadUrl, {
//         method: 'PUT',
//         headers: {'Content-Type': file.type},
//         body: file,
//       })
//       if (!put.ok) throw new Error('Upload thất bại')

//       onChange(set(publicUrl))
//     } catch (err: any) {
//       setError(err.message)
//     } finally {
//       setUploading(false)
//     }
//   }

//   return (
//     <Stack>
//       <input type="file" onChange={handleFile} disabled={uploading} />
//       {uploading && <Text size={1}>Đang upload...</Text>}
//       {error && (
//         <Card tone="critical" padding={2}>
//           <Text size={1}>{error}</Text>
//         </Card>
//       )}
//       {value && (
//         <>
//           <Text size={1}>
//             <a href={value} target="_blank" rel="noreferrer">
//               {value}
//             </a>
//           </Text>
//           <Button text="Xóa" tone="critical" onClick={() => onChange(unset())} />
//         </>
//       )}
//     </Stack>
//   )
// }

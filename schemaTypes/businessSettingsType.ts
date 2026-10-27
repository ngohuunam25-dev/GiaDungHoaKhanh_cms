import {defineField, defineType} from 'sanity'

export const businessSettingsType = defineType({
  name: 'businessSettings',
  title: 'Cấu hình cửa hàng',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tên cấu hình',
      type: 'string',
      initialValue: 'Thông tin cửa hàng',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'companyName',
      title: 'Tên cửa hàng / doanh nghiệp',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brandName',
      title: 'Tên thương hiệu hiển thị',
      type: 'string',
    }),
    defineField({
      name: 'brandDescription',
      title: 'Mô tả thương hiệu',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'hotline',
      title: 'Hotline',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Địa chỉ',
      type: 'text',
    }),
    defineField({
      name: 'businessHours',
      title: 'Giờ hoạt động',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Điểm đánh giá trung bình',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: 'reviewCountLabel',
      title: 'Nhãn số lượng đánh giá',
      type: 'string',
      description: 'Ví dụ: Hơn 1.000 khách hàng đánh giá',
    }),
    defineField({
      name: 'copyright',
      title: 'Nội dung bản quyền',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'companyName',
      media: 'logo',
    },
  },
})

import {defineField, defineType} from 'sanity'

export const reviewObject = defineType({
  name: 'reviewObject',
  title: 'Đánh giá khách hàng',
  type: 'object',
  fields: [
    defineField({
      name: 'customerName',
      title: 'Tên khách hàng',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Địa điểm',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Số sao',
      type: 'number',
      initialValue: 5,
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'content',
      title: 'Nội dung đánh giá',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Ảnh khách hàng hoặc sản phẩm',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {
      title: 'customerName',
      subtitle: 'content',
      media: 'image',
    },
  },
})

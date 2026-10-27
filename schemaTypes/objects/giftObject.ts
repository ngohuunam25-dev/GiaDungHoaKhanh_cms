import {defineField, defineType} from 'sanity'

export const giftObject = defineType({
  name: 'giftObject',
  title: 'Quà tặng',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Tên quà tặng',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Mô tả',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Hình ảnh',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      media: 'image',
    },
  },
})

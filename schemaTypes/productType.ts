import {defineField, defineType} from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Sản phẩm',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tên sản phẩm',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sku',
      title: 'Mã sản phẩm',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Mô tả sản phẩm',
      type: 'text',
    }),
    defineField({
      name: 'images',
      title: 'Thư viện hình ảnh',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Mô tả ảnh',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'basePrice',
      title: 'Giá niêm yết',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'features',
      title: 'Đặc điểm sản phẩm',
      type: 'array',
      of: [{type: 'string'}],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'sku',
      media: 'images.0',
    },
  },
})

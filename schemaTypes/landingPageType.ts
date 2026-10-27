import {defineField, defineType} from 'sanity'

export const landingPageType = defineType({
  name: 'landingPage',
  title: 'Landing Pages',
  type: 'document',

  groups: [
    {name: 'general', title: 'Thông tin chung', default: true},
    {name: 'hero', title: 'Hero'},
    {name: 'content', title: 'Nội dung'},
    {name: 'offers', title: 'Giá và combo'},
    {name: 'reviews', title: 'Đánh giá'},
    {name: 'conversion', title: 'Chuyển đổi'},
  ],

  fields: [
    // 1. Thông tin chung
    defineField({
      name: 'title',
      title: 'Tên landing page',
      type: 'string',
      group: 'general',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug URL',
      type: 'slug',
      group: 'general',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isPublished',
      title: 'Cho phép hiển thị trên website',
      type: 'boolean',
      group: 'general',
      initialValue: false,
    }),
    defineField({
      name: 'businessSettings',
      title: 'Cấu hình cửa hàng',
      type: 'reference',
      group: 'general',
      to: [{type: 'businessSettings'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'announcementBar',
      title: 'Thanh thông báo',
      type: 'object',
      group: 'general',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Bật thanh thông báo',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'badge',
          title: 'Nhãn khuyến mãi',
          type: 'string',
        }),
        defineField({
          name: 'text',
          title: 'Nội dung thông báo',
          type: 'string',
        }),
      ],
    }),

    // 2. Hero
    defineField({
      name: 'hero',
      title: 'Hero section',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Nhãn nhỏ phía trên',
          type: 'string',
        }),
        defineField({
          name: 'headline',
          title: 'Tiêu đề chính',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'description',
          title: 'Mô tả',
          type: 'text',
        }),
        defineField({
          name: 'discountBadge',
          title: 'Nhãn giảm giá',
          type: 'string',
        }),
        defineField({
          name: 'images',
          title: 'Ảnh Hero',
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
          name: 'ctaText',
          title: 'Nội dung nút CTA',
          type: 'string',
        }),
        defineField({
          name: 'ctaNote',
          title: 'Ghi chú dưới CTA',
          type: 'string',
        }),
      ],
    }),

    // 3. Giá bán
    defineField({
      name: 'pricing',
      title: 'Thông tin giá',
      type: 'object',
      group: 'offers',
      fields: [
        defineField({
          name: 'salePrice',
          title: 'Giá khuyến mãi',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        }),
        defineField({
          name: 'originalPrice',
          title: 'Giá gốc',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        }),
        defineField({
          name: 'savingsLabel',
          title: 'Nhãn tiết kiệm',
          type: 'string',
        }),
        defineField({
          name: 'stockLabel',
          title: 'Nhãn tồn kho',
          type: 'string',
        }),
        defineField({
          name: 'ctaText',
          title: 'Nội dung nút CTA',
          type: 'string',
        }),
      ],
    }),

    // 4. So sánh trước và sau
    defineField({
      name: 'comparison',
      title: 'So sánh sản phẩm',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'title',
          title: 'Tiêu đề',
          type: 'string',
        }),
        defineField({
          name: 'oldProduct',
          title: 'Giải pháp cũ',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Tên',
              type: 'string',
            }),
            defineField({
              name: 'points',
              title: 'Các điểm hạn chế',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Tiêu đề ý (VD: Lồng nhựa giòn gãy)',
                      type: 'string',
                    }),
                    defineField({
                      name: 'description',
                      title: 'Mô tả chi tiết',
                      type: 'text',
                    }),
                  ],
                },
              ],
            }),
          ],
        }),
        defineField({
          name: 'newProduct',
          title: 'Giải pháp mới',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Tên',
              type: 'string',
            }),
            defineField({
              name: 'points',
              title: 'Các ưu điểm',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Tiêu đề ý (VD: Lồng nhựa giòn gãy)',
                      type: 'string',
                    }),
                    defineField({
                      name: 'description',
                      title: 'Mô tả chi tiết',
                      type: 'text',
                    }),
                  ],
                },
              ],
            }),
          ],
        }),
      ],
    }),

    // 5. Video giới thiệu
    defineField({
      name: 'videoShowcase',
      title: 'Video giới thiệu',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'title',
          title: 'Tiêu đề',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Mô tả',
          type: 'text',
        }),
        defineField({
          name: 'videos',
          title: 'Danh sách video',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Tên video',
                  type: 'string',
                }),
                defineField({
                  name: 'description',
                  title: 'Mô tả video',
                  type: 'string',
                }),
                defineField({
                  name: 'videoUrl',
                  title: 'URL video',
                  type: 'url',
                  description: 'Có thể dùng URL video công khai trên Cloudflare R2.',
                  validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
                }),
                defineField({
                  name: 'thumbnail',
                  title: 'Ảnh thumbnail',
                  type: 'image',
                  options: {hotspot: true},
                }),
                defineField({
                  name: 'badge',
                  title: 'Nhãn video',
                  type: 'string',
                }),
              ],
              preview: {
                select: {
                  title: 'title',
                  subtitle: 'description',
                  media: 'thumbnail',
                },
              },
            },
          ],
        }),
      ],
    }),

    // 6. Đặc điểm sản phẩm
    defineField({
      name: 'features',
      title: 'Đặc điểm nổi bật',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'title',
          title: 'Tiêu đề',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Mô tả',
          type: 'text',
        }),
        defineField({
          name: 'items',
          title: 'Danh sách đặc điểm',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Tên đặc điểm',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'description',
                  title: 'Mô tả',
                  type: 'text',
                }),
                defineField({
                  name: 'image',
                  title: 'Hình ảnh',
                  type: 'image',
                  options: {hotspot: true},
                }),
                defineField({
                  name: 'badge',
                  title: 'Nhãn',
                  type: 'string',
                }),
              ],
              preview: {
                select: {
                  title: 'title',
                  subtitle: 'description',
                  media: 'image',
                },
              },
            },
          ],
        }),
      ],
    }),

    // 7. Combo / gói bán hàng
    defineField({
      name: 'packages',
      title: 'Các gói bán hàng',
      type: 'array',
      group: 'offers',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'id',
              title: 'Mã gói',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'name',
              title: 'Tên gói',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Mô tả',
              type: 'string',
            }),
            defineField({
              name: 'product',
              title: 'Sản phẩm',
              type: 'array',
              of: [
                {
                  type: 'reference',
                  to: [{type: 'product'}],
                },
              ],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'quantity',
              title: 'Số lượng sản phẩm',
              type: 'number',
              initialValue: 1,
              validation: (Rule) => Rule.required().min(1).integer(),
            }),
            defineField({
              name: 'price',
              title: 'Giá combo',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: 'originalPrice',
              title: 'Giá gốc combo',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            }),
            defineField({
              name: 'shippingFee',
              title: 'Phí vận chuyển',
              type: 'number',
              initialValue: 0,
              validation: (Rule) => Rule.min(0),
            }),
            defineField({
              name: 'freeShipping',
              title: 'Miễn phí vận chuyển',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'badge',
              title: 'Nhãn combo',
              type: 'string',
            }),
            defineField({
              name: 'isRecommended',
              title: 'Combo đề xuất',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'gifts',
              title: 'Quà tặng kèm',
              type: 'array',
              of: [{type: 'giftObject'}],
            }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'price',
            },
          },
        },
      ],
    }),

    // 8. Đánh giá khách hàng
    defineField({
      name: 'socialProof',
      title: 'Bằng chứng xã hội',
      type: 'object',
      group: 'reviews',
      fields: [
        defineField({
          name: 'title',
          title: 'Tiêu đề',
          type: 'string',
        }),
        defineField({
          name: 'soldCountLabel',
          title: 'Nhãn số lượng đã bán',
          type: 'string',
        }),
        defineField({
          name: 'averageRating',
          title: 'Điểm đánh giá trung bình',
          type: 'number',
          validation: (Rule) => Rule.min(0).max(5),
        }),
        defineField({
          name: 'reviews',
          title: 'Danh sách đánh giá',
          type: 'array',
          of: [{type: 'reviewObject'}],
        }),
      ],
    }),

    // 9. Form đặt hàng
    defineField({
      name: 'orderForm',
      title: 'Form đặt hàng',
      type: 'object',
      group: 'conversion',
      fields: [
        defineField({
          name: 'title',
          title: 'Tiêu đề',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Mô tả',
          type: 'text',
        }),
        defineField({
          name: 'nameLabel',
          title: 'Nhãn tên khách hàng',
          type: 'string',
        }),
        defineField({
          name: 'phoneLabel',
          title: 'Nhãn số điện thoại',
          type: 'string',
        }),
        defineField({
          name: 'addressLabel',
          title: 'Nhãn địa chỉ',
          type: 'string',
        }),
        defineField({
          name: 'submitText',
          title: 'Nội dung nút gửi',
          type: 'string',
        }),
        defineField({
          name: 'successMessage',
          title: 'Thông báo gửi thành công',
          type: 'string',
        }),
        defineField({
          name: 'guarantees',
          title: 'Cam kết',
          type: 'array',
          of: [{type: 'string'}],
        }),
      ],
    }),

    // 10. Sticky CTA trên mobile
    defineField({
      name: 'stickyCTA',
      title: 'CTA cố định trên mobile',
      type: 'object',
      group: 'conversion',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Bật CTA',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'label',
          title: 'Nội dung đặt hàng',
          type: 'string',
        }),
        defineField({
          name: 'callButtonLabel',
          title: 'Nội dung nút gọi',
          type: 'string',
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
  },
})

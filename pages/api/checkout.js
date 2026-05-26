export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { variantId, email } = req.body

  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: email || '',
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: process.env.LEMONSQUEEZY_STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }),
    })

    const data = await response.json()
    const checkoutUrl = data?.data?.attributes?.url

    if (!checkoutUrl) {
      return res.status(500).json({ error: 'Could not create checkout' })
    }

    return res.status(200).json({ url: checkoutUrl })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Checkout failed' })
  }
}

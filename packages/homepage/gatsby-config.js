require('dotenv').config();

module.exports = {
  siteMetadata: {
    title: `CodeSandbox`,
    siteUrl: 'https://codesandbox.io',
  },
  plugins: [
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'content',
        path: `${__dirname}/content/`,
      },
    },
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        pedantic: false,
        plugins: [
          `gatsby-remark-copy-linked-files`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 740,
              linkImagesToOriginal: true,
              sizeByPixelDensity: true,
            },
          },
          { resolve: require.resolve(`./plugins/remark-sections`) },
          'gatsby-remark-autolink-headers',
          `gatsby-remark-prismjs`,
          { resolve: require.resolve('./plugins/remark-embedder') },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-nprogress',
      options: {
        color: '#40A9F3',
      },
    },
    `gatsby-plugin-twitter`,
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-remove-trailing-slashes`,
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-google-tagmanager`,
      options: {
        id: 'GTM-T3L6RFK',
      },
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `Poppins:600,700,800`,
          `source sans pro:300,400,500,600,700`,
          'open sans:300,400',
        ],
      },
    },
    {
      resolve: `gatsby-source-airtable`,
      options: {
        apiKey: 'keyJugfwdJzOyL7Aa',
        tables: [
          {
            baseId: `app7kKUn5uIviyA1f`,
            tableName: `Table`,
            tableView: `Grid view`,
            queryName: `starters`,
          },
        ],
      },
    },
  ],
};

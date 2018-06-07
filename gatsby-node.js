const path = require(`path`)

exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators
  let slug
  if (
    node.internal.type === `MarkdownRemark` ||
    node.internal.type === `JSFrontmatter`
  ) {
    try {
      const fileNode = getNode(node.parent)
      const parsedFilePath = path.parse(fileNode.relativePath)
      if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
        slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
      } else if (parsedFilePath.dir === ``) {
        slug = `/${parsedFilePath.name}/`
      } else {
        slug = `/${parsedFilePath.dir}/`
      }
  
      // Add slug as a field on the node.
      createNodeField({ node, name: `slug`, value: slug })
    } catch (error) {
      // nil
    }
  }

  if (
    node.internal.type === `AirtableLinked` &&
    node.table === `Recipes`
  ) {
    slug = `/${node.data.Name.replace(/ /g, '-').replace(/[,&]/g, '').toLowerCase()}/`

    // Add slug as a field on the node.
    createNodeField({ node, name: `slug`, value: slug })
  }

}

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage, createRedirect } = boundActionCreators

  return new Promise((resolve, reject) => {
    const pages = []
    const mdSimplePage = path.resolve(`src/templates/mdSimplePage.js`)
    const mdBlogPost = path.resolve(`src/templates/SimpleBlogPostTemplate.js`)
    const atRecipes = path.resolve(`src/templates/SimpleRecipeTemplate.js`)

    // Query for all markdown "nodes" and for the slug we previously created.
    resolve(
      graphql(
        `
          {
            allMarkdownRemark {
              edges {
                node {
                  frontmatter {
                    layoutType
                    path
                  }
                  fields {
                    slug
                  }
                }
              }
            }
            allJsFrontmatter {
              edges {
                node {
                  fileAbsolutePath
                  data {
                    layoutType
                    path
                  }
                  fields {
                    slug
                  }
                }
              }
            }
            allAirtableLinked(filter: {table: {eq: "Recipes"}}) {
              edges {
                node {
                  id
                  data {
                    Name
                  }
                  fields {
                    slug
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          console.log(result)
          reject(result.errors)
        }

        // Create from markdown
        result.data.allMarkdownRemark.edges.forEach(edge => {
          let frontmatter = edge.node.frontmatter
          if (frontmatter.layoutType === `page`) {
            createPage({
              path: frontmatter.path, // required
              component: mdSimplePage,
              context: {
                slug: edge.node.fields.slug,
              },
            })
          } else if (frontmatter.layoutType === `post`) {
            createPage({
              path: frontmatter.path, // required
              component: mdBlogPost,
              context: {
                slug: edge.node.fields.slug,
                heroImage: `${edge.node.fields.slug.replace(/\//gi, "")}/hero.jpg`,
              }
            })
          }
        })

        // Create pages from javascript
        // Gatsby will, by default, createPages for javascript in the
        //  /pages directory. We purposely don't have a folder with this name
        //  so that we can go full manual mode.
        result.data.allJsFrontmatter.edges.forEach(edge => {
          let frontmatter = edge.node.data
          // see above
          if (frontmatter.layoutType === `post`) {
            createPage({
              path: frontmatter.path, // required
              component: path.resolve(edge.node.fileAbsolutePath),
              context: {
                slug: edge.node.fields.slug,
              },
            })
          } else if (frontmatter.layoutType === `page`) {
              createPage({
                path: frontmatter.path, // required
                component: path.resolve(edge.node.fileAbsolutePath),
                context: {
                  slug: edge.node.fields.slug,
                },
              })
          } else if (edge.node.fields.slug === `/index/`) {
            createPage({
              path: `/`, // required, we don't have frontmatter for this page hence separate if()
              component: path.resolve(edge.node.fileAbsolutePath),
              context: {
                slug: edge.node.fields.slug,
              },
            })
          }
        })

        result.data.allAirtableLinked.edges.forEach(edge => {
          createPage({
            path: edge.node.fields.slug, // required, we don't have frontmatter for this page hence separate if()
            component: atRecipes,
            context: {
              name: edge.node.data.Name,
            },
          })
        })

        createRedirect({ fromPath: '/contact/', toPath: '/', isPermanent: true })
        createRedirect({ fromPath: '/about/', toPath: '/', isPermanent: true })

        return
      })
    )
  })
}

exports.modifyWebpackConfig = ({ config, stage }) => {
  config.merge({
     node: { fs: 'empty', child_process: 'empty' },
  })

  return config;
};

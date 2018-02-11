import React from "react"
import moment from "moment"
import BlogPostChrome from "../components/BlogPostChrome"

class mdBlogPost extends React.Component {
  render() {
    const {html, frontmatter} = this.props.data.post

    return (
      <BlogPostChrome {...this.props.data}>
        <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
      </BlogPostChrome>
    )
  }
}

export default mdBlogPost

export const pageQuery = graphql`
  query mdBlogPostBySlug($slug: String!) {
    post: markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      ...MarkdownBlogPost_frontmatter
    }
  }
`
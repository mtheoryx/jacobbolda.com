import React from 'react';
import Helmet from 'react-helmet';

const BUILD_TIME = new Date().getTime();

module.exports = React.createClass({
    displayName: 'HTML',
    propTypes: {
        body: React.PropTypes.string,
    },
    render() {
        const {body, route} = this.props;
        const head = Helmet.rewind();
        const font = <link href='https://fonts.googleapis.com/css?family=Roboto:400,400italic,500,700&subset=latin,cyrillic' rel='stylesheet' type='text/css' />
        let css
        if (process.env.NODE_ENV === 'production') {
            css = <style dangerouslySetInnerHTML={ {    __html: require('!raw!./public/styles.css')} } />
        }

        const gaHead = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-5BSQFD');`;

        return (
            <html lang="en">
            <head>
              <meta charSet="utf-8" />
              <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0 maximum-scale=5.0" />
              {/* Google Tag Manager */}
              <script dangerouslySetInnerHTML={{__html: gaHead }}></script>
              {/* End Google Tag Manager */}
              { head.title.toComponent() }
              { head.meta.toComponent() }
              { font }
              { css }
              { this.props.headComponents }
            </head>
            <body>
              {/* Google Tag Manager (noscript) */}
              <noscript>
                <iframe
                  src={'https://www.googletagmanager.com/ns.html?id=GTM-5BSQFD'}
                  height={0}
                  width={0}
                  style={{ display: 'none', visibility: 'hidden'}}>
                </iframe>
              </noscript>
              {/* End Google Tag Manager (noscript) */}
              <div id="react-mount" dangerouslySetInnerHTML={ {    __html: this.props.body} } />
              { this.props.postBodyComponents }
            </body>
            </html>
        )
    },
})
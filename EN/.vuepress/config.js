module.exports = {
  title: 'Magician',
  description: 'A Java development toolkit for most blockchain and web development scenarios',
  base: '/en/',
  head: [
    ['meta', { name: 'keywords', content: 'Magician,Magician框架,小型服务框架,开源http服务,web开发,Java,开源项目,NIO,区块链开发,以太坊,扫块,ETH,ARB,arb,eth,blockchain' }],
    [
      'script', {},
      `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?401bcc2cac34ec3ca684af0b43a29de9";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
      `
    ]
  ],
  themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Github',
          items: [
            { text: 'Block Chain', link: 'https://github.com/Magician-Blockchain'},
            { text: 'Web', link: 'https://github.com/JMagician'}
          ]
        },
        {
          text: 'Document',
          items: [
            { text: 'Block Chain', link: '/chain/index.md' },
            { text: 'Magician', link: '/web/index.md' },
            { text: 'Magician-JDBC', link: '/db/index.md' },
            { text: 'Magician-Web', link: '/web/magician-web.md' }
          ]
        },
        { text: 'Sponsor', link: '/sponsor/sponsor.md' }, 
        { text: 'Social Networks', 
            items: [
              {text: 'Telegram', link: 'https://t.me/magicianio'},
              { text: 'Bilibili', link: 'https://space.bilibili.com/41981562' }
            ]
        },
        { text: 'Business Cooperation', link: '/business/business.md' },
        {
          text: '语言',
          items: [
            { text: '简体中文', link: 'https://magician-io.com' },
            { text: 'English', link: 'https://magician-io.com/en/' }
          ]
        }
      ],
      sidebar: 'auto'
    }
}
module.exports = {
  title: 'Magician',
  description: '一套Java开发的工具包，可以满足区块链 和 Web开发的大部分场景',
  base: '/',
  head: [
    ['meta', { name: 'keywords', content: 'Magician,Magician框架,小型服务框架,开源http服务,web开发,Java,开源项目,NIO,区块链开发,以太坊,扫块,ETH,ARB,arb,eth,blockchain' }],
    [
      'script', {},
      `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?4a88f95406930c3f864feabd8e0b5c12";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
      `
    ]
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: 'Github',
        items: [
          { text: '区块链', link: 'https://github.com/Magician-Blockchain' },
          { text: 'Web', link: 'https://github.com/JMagician' }
        ]
      },
      {
        text: '文档',
        items: [
          { text: '区块链', link: '/chain/index.md' },
          { text: 'Magician', link: '/web/index.md' },
          { text: 'Magician-JDBC', link: '/db/index.md' },
          { text: 'Magician-Web', link: '/web/magician-web.md' }
        ]
      },
      { text: '赞助', link: '/sponsor/sponsor.md' },
      {
        text: '社交平台',
        items: [
          { text: 'Telegram', link: 'https://t.me/magicianio' },
          { text: 'B站', link: 'https://space.bilibili.com/41981562' }
        ]
      },
      { text: '商业合作', link: '/business/business.md' },
      {
        text: 'Languages',
        items: [
          { text: '简体中文', link: 'https://magician-io.com' },
          { text: 'English', link: 'https://magician-io.com/en/' }
        ]
      }
    ],
    sidebar: 'auto'
  }
}
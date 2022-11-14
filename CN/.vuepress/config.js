module.exports = {
    title: 'Magician',
    description: '一套Java开发的工具包，可以满足区块链 和 Web开发的大部分场景',
    base: '/cn/',
    themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { 
            text: 'Github', 
            items: [
              { text: '区块链', link: 'https://github.com/Magician-blockchain'},
              { text: 'Web', link: 'https://github.com/JMagician'}
            ]
          },              
          { text: '社区', link: 'https://github.com/JMagician/Magician/discussions' },
          {
            text: '文档',
            items: [
              { text: '区块链', link: '/chain/index.md' },
              { text: 'Magician', link: '/web/index.md' },
              { text: 'Magician-JDBC', link: '/db/index.md' }
            ]
          },
          { text: '赞助', link: '/sponsor/sponsor.md' }, 
          { text: '社交平台', 
            items: [
              {text: 'Telegram', link: 'https://t.me/magicianio'},
              {text: '微博(@Beeruscc)', link: 'https://weibo.com/u/5453518101'}
            ]
          },
          {
            text: 'Languages',
            items: [
              { text: '简体中文', link: 'https://magician-io.com/cn/' },
              { text: 'English', link: 'https://magician-io.com' }
            ]
          },
          { text: 'Golang版本', link: 'https://beeruscc.com' }
        ],
        sidebar: 'auto'
      }
}
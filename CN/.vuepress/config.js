module.exports = {
    title: 'Magician',
    description: '基于Netty开发的Web解决方案',
    base: '/cn/',
    themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: 'Github', link: 'https://github.com/JMagician' },              
          { text: '社区', link: 'https://github.com/JMagician/Magician/discussions' },
          {
            text: '文档',
            items: [
              { text: 'Magician', link: '/web/index.md' },
              { text: 'Magician-JDBC', link: '/db/index.md' }
            ]
          },
          { text: '赞助', link: '/sponsor/sponsor.md' }, 
          { text: 'Telegram', link: 'https://t.me/magicianio'},
          {
            text: '语言',
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
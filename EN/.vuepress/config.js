module.exports = {
  title: 'Magician',
  description: 'A Java development toolkit for most blockchain and web development scenarios',
  base: '/',
  themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Github',
          items: [
            { text: 'Block Chain', link: 'https://github.com/Magician-blockchain'},
            { text: 'Web', link: 'https://github.com/JMagician'}
          ]
        },              
        { text: 'Discussions', link: 'https://github.com/JMagician/Magician/discussions' },
        {
          text: 'Document',
          items: [
            { text: 'Block Chain', link: '/chain/index.md' },
            { text: 'Magician', link: '/web/index.md' },
            { text: 'Magician-JDBC', link: '/db/index.md' }
          ]
        },
        { text: 'Sponsor', link: '/sponsor/sponsor.md' }, 
        { text: 'Social Networks', 
            items: [
              {text: 'Telegram', link: 'https://t.me/magicianio'},
              {text: 'Weibo(@Beeruscc)', link: 'https://weibo.com/u/5453518101'}
            ]
          },
        {
          text: 'Languages',
          items: [
            { text: '简体中文', link: 'https://magician-io.com/cn/' },
            { text: 'English', link: 'https://magician-io.com' }
          ]
        },
        { text: 'Golang', link: 'https://beeruscc.com' }
      ],
      sidebar: 'auto'
    }
}
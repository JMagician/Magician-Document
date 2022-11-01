module.exports = {
  title: 'Magician',
  description: 'Web solutions based on Netty development',
  base: '/',
  themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Github',
          items: [
            { text: 'Web', link: 'https://github.com/JMagician'},
            { text: 'Block Chain', link: 'https://github.com/Magician-blockchain'}
          ]
        },              
        { text: 'Discussions', link: 'https://github.com/JMagician/Magician/discussions' },
        {
          text: 'Document',
          items: [
            { text: 'Magician', link: '/web/index.md' },
            { text: 'Magician-JDBC', link: '/db/index.md' },
            { text: 'Block Chain', link: '/db/index.md' }
          ]
        },
        { text: 'Sponsor', link: '/sponsor/sponsor.md' }, 
        { text: 'Telegram', link: 'https://t.me/magicianio'},
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
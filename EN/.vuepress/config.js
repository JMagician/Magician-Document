module.exports = {
  title: 'Magician',
  description: '基于Netty开发的Web解决方案',
  base: '/',
  themeConfig: {
      nav: [
        { text: '首页', link: '/' },
        { text: 'Github', link: 'https://github.com/JMagician' },              
        { text: '社区', link: 'https://github.com/JMagician/Magician/discussions' },
        { text: '赞助', link: '/sponsor/sponsor.md' }, 
        {
          text: '文档',
          items: [
            { text: 'Magician', link: '/web/index.md' },
            { text: 'Magician-JDBC', link: '/db/index.md' }
          ]
        }
      ],
      sidebar: 'auto'
    }
}
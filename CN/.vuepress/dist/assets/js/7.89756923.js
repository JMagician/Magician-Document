(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{408:function(t,a,v){"use strict";v.r(a);var i=v(56),e=Object(i.a)({},(function(){var t=this,a=t.$createElement,v=t._self._c||a;return v("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[v("h2",{staticStyle:{margin:"0px"}},[t._v("设计理念")]),t._v(" "),v("p",[v("span",{staticStyle:{color:"#000000","font-weight":"bold"}},[t._v("本项目并不是为了打造一个工具包，而是希望可以解决一些业务需求，用于减少开发中的工作量或者设计负担。")])]),t._v(" "),v("p",[t._v("就拿目前已经发布的这几个功能模块来举个例子，我们完全可以把它们连城一条线，【利用数据库操作模块从数据库查询数据】->【通过生产者处理后推送给消费者】->【消费者拿到数据后，利用集合处理、并发任务 这两个功能来消费数据、处理对应的业务逻辑】")]),t._v(" "),v("p",[t._v("而【属性文件读取】功能模块，可以让你在脱离框架的环境下开发时，实现将配置项放入文件里")]),t._v(" "),v("p",[v("span",{staticStyle:{color:"#000000","font-weight":"bold"}},[t._v("我们还可以将这几个模块分开使用，比如：")])]),t._v(" "),v("p",[t._v("✅ 当我们有一个很大的List或者Map需要遍历，根据每一条元素来判断处理，这个时候我们就可以用到【集合处理】功能模块，他可以多线程遍历。")]),t._v(" "),v("p",[t._v("✅ 当同一个请求需要处理若干个没有因果关系的业务逻辑时，我们可以用到【并发任务】功能模块，他可以将这几个业务逻辑并发处理掉。")]),t._v(" "),v("p",[t._v("✅ 当我们需要操作数据库的时候，不需要再引入那么大庞大复杂的MyBatis或者JPA了，而是直接用Spring自带的JdbcTemplate就可以达到目的，因为他不好用，所以我们进行了扩展，也就是【数据库操作】功能模块。")]),t._v(" "),v("br"),t._v(" "),v("h2",{staticStyle:{margin:"0px"}},[t._v("核心功能")]),t._v(" "),v("div",{staticClass:"features",staticStyle:{border:"0px","margin-top":"0px","padding-top":"0px"}},[v("div",{staticClass:"feature"},[v("h2",[t._v("集合处理")]),t._v(" "),v("p",[t._v("通过分组+多线程的方式对集合元素进行处理，线程数量完全可控，不会造成线程创建太多的局面，可以有效提高处理集合元素的效率")])]),t._v(" "),v("div",{staticClass:"feature"},[v("h2",[t._v("并发任务")]),t._v(" "),v("p",[t._v("\n      对于需要并发处理的多个任务，不需要自己创建与管理线程，只需要专注在业务逻辑上\n    ")])]),t._v(" "),v("div",{staticClass:"feature"},[v("h2",[t._v("生产者与消费者模型")]),t._v(" "),v("p",[t._v("\n      采用多对多模型，多个生产者可以对应多个消费者，这样的对应关系为一组，而这样的组合可以创建多个，并且可以有效避免队列积压\n    ")])]),t._v(" "),v("div",{staticClass:"feature"},[v("h2",[t._v("数据库操作")]),t._v(" "),v("p",[t._v("\n      基于Spring的JdbcTemplate做的扩展，做到了单表操作不需要写SQL，天然支持MySql分页查询，支持在SQL中写入{属性名}占位符\n    ")])]),t._v(" "),v("div",{staticClass:"feature"},[v("h2",[t._v("属性文件读取")]),t._v(" "),v("p",[t._v("\n      可以读取resource目录，本机目录，远程目录下的properties文件，可以遍历也可以根据key方便的找到value，如果key不存在会自动去环境变量里再找一次，也就是说它不仅会读取properties文件还会读取环境变量。\n    ")])]),t._v(" "),v("div",{staticClass:"feature"},[v("h2",[t._v("不止于此")]),t._v(" "),v("p",[t._v("\n      后面还会陆陆续续推出一些新的功能\n    ")])])]),t._v(" "),v("h2",{staticStyle:{margin:"0px"}},[t._v("更多项目")]),t._v(" "),v("div",{staticClass:"features",staticStyle:{border:"0px","margin-top":"0px","padding-top":"0px"}},[v("div",{staticClass:"feature"},[v("h2",[t._v("Magician-Scanning")]),t._v(" "),v("p",[t._v("\n      Magician-Scanning是一个用Java开发的扫描区块链的工具包，它可以根据开发者的需求来监控交易，它计划支持三个链，ETH（BSC、POLYGON等）、SOL和TRON。\n    ")])]),t._v(" "),v("div",{staticClass:"feature"},[v("h2",[t._v("Magician-ContractsTools")]),t._v(" "),v("p",[t._v("\n      Magician-ContractsTools是一个用于调用智能合约的工具包，你可以非常容易地在Java程序中调用智能合约进行查询和写入操作。\n    ")])]),t._v(" "),v("div",{staticClass:"feature"},[v("h2",[t._v("Magician-Http")]),t._v(" "),v("p",[t._v("基于Netty开发的一个 小型Http服务，支持http和WebSocket，可以采用注解来声明Handler")])]),t._v(" "),v("div",{staticClass:"feature"},[v("h2",[t._v("Magician-Route")]),t._v(" "),v("p",[t._v("Magician-Route是由Magician-Web发展而来，主要是去掉了里面的反射，牺牲了一点易用性，将侧重点放在了性能上")])]),t._v(" "),v("div",{staticClass:"feature"},[v("h2",[t._v("Magician-JDBC")]),t._v(" "),v("p",[t._v("一个数据库操作框架，支持多数据源，事务管理，分页查询，单表操作无SQL，复杂操作可以自己写SQL，支持实体参数，支持{}和?占位符")])]),t._v(" "),v("div",{staticClass:"feature"},[v("h2",[t._v(" ")]),t._v(" "),v("p",[t._v(" ")])])])])}),[],!1,null,null,null);a.default=e.exports}}]);
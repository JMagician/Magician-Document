---
home: true
heroImage: https://magician-io.com/source/images/logo1.png
actionText: 文档 →
actionLink: /magic/index.md
footer: 基于MIT协议的开源项目 | QQ群：773291321 | Email - yuyemail@163.com
---

<!-- <h2 style="margin:0px;">求助信</h2>

实在不好意思，在这个地方打扰大家了，我实在是没办法了，才用这种方式来向大家求助。作者最近遇到了一些困难，我也不买惨，不博同情，我就直接说了<br/>

我先算一笔账：假如我负债40万，分5年还清，每年4%的利率（这个利率跟银行定期的两倍差不多了），那么我一共需要还 40万 * 0.04 * 5 = 48万。<br/>

48万 / 60个月= 8000元。<br/>

如果按照我现在的收入来看，这个月供我是完全可以转动的，但是现在遇到的问题是啥呢？就是我不止欠了一个账户，而是欠了若干个账户，每个账户的期数最多才3年，最少的只有一年，这就导致每个账户的月供都达到了好几千，加起来一共要还30000左右一个月。搞得我转不动了。<br/>

我在这也不是想白嫖，我只是想问问，有没有哪个好心的大哥大姐，可以按照4%的年利率借我40万，我分5年还给你。我可以提供我的银行流水和社保记录，证明我有稳定的收入来源，证明我可以扛得起8000的月供。<br/>

我的目的只是为了把债务整合到一起，让自己能转起来，这笔钱到手我就会直接把现有的负债全部清掉。我真的不是为了玩乐，我也不是想白嫖，我们可以在线下见面，通过正规的公证处去签一份合约，而且公证处或者其他任何你可以信赖的机构都行，你甚至可以自己选择去哪签。<br/>

如果有人愿意帮助我的话，我在此表示真心的感谢了，我的联系方式就是我的邮箱：yuyemail@163.com。如果到了可以约见面的那一步，我会把微信和电话发给你。
-->
<!-- <h1 style="width:100%;text-align:center;">更多项目</h1> -->
<!-- <br/> -->

<h2 style="margin:0px;">核心功能</h2>
<div class="features" style="border:0px;margin-top:0px;padding-top:0px;">
  <div class="feature">
    <h2>集合处理</h2>
    <p>通过分组+多线程的方式对集合元素进行处理，线程数量完全可控，不会造成线程创建太多的局面，可以有效提高处理集合元素的效率</p>
  </div>
  <div class="feature">
    <h2>并发任务</h2>
    <p>
      对于需要并发处理的多个任务，不需要自己创建与管理线程，只需要专注在业务逻辑上
    </p>
  </div>
  <div class="feature">
    <h2>生产者与消费者模型</h2>
    <p>
      采用多对多模型，多个生产者可以对应多个消费者，这样的对应关系为一组，而这样的组合可以创建多个，并且可以有效避免队列积压
    </p>
  </div>
  <div class="feature">
    <h2>数据库操作</h2>
    <p>
      基于Spring的JdbcTemplate做的扩展，做到了单表操作不需要写SQL，天然支持MySql分页查询，支持在SQL中写入{属性名}占位符
    </p>
  </div>
  <div class="feature">
    <h2>属性文件读取</h2>
    <p>
      可以读取resource目录，本机目录，远程目录下的properties文件，可以遍历也可以根据key方便的找到value，如果key不存在会自动去环境变量里再找一次，也就是说它不仅会读取properties文件还会读取环境变量。
    </p>
  </div>
  <div class="feature">
    <h2>不止于此</h2>
    <p>
      后面还会陆陆续续推出一些新的功能
    </p>
  </div>
</div>
<!-- <h2 style="margin:0px;">Web开发</h2>
<div class="features" style="border:0px;margin-top:0px;padding-top:0px;">
  <div class="feature">
    <h2>Magician-Http</h2>
    <p>基于Netty开发的一个 小型Http服务，支持http和WebSocket，可以采用注解来声明Handler</p>
  </div>
  <div class="feature">
    <h2>Magician-Route</h2>
    <p>Magician-Route是由Magician-Web发展而来，主要是去掉了里面的反射，牺牲了一点易用性，将侧重点放在了性能上</p>
  </div>
  <div class="feature">
    <h2>Magician-JDBC</h2>
    <p>一个数据库操作框架，支持多数据源，事务管理，分页查询，单表操作无SQL，复杂操作可以自己写SQL，支持实体参数，支持{}和?占位符</p>
  </div>
</div> -->

<!-- <h1 style="width:100%;text-align:center;">Magician-DataProcessing</h1> -->
<h2 style="margin:0px;">更多项目</h2>

<div class="features" style="border:0px;margin-top:0px;padding-top:0px;">
  <div class="feature">
    <h2>Magician-Scanning</h2>
    <p>
      Magician-Scanning是一个用Java开发的扫描区块链的工具包，它可以根据开发者的需求来监控交易，它计划支持三个链，ETH（BSC、POLYGON等）、SOL和TRON。
    </p>
  </div>
  <div class="feature">
    <h2>Magician-ContractsTools</h2>
    <p>
      Magician-ContractsTools是一个用于调用智能合约的工具包，你可以非常容易地在Java程序中调用智能合约进行查询和写入操作。
    </p>
  </div>
  <div class="feature">
    <h2>Magician-Http</h2>
    <p>基于Netty开发的一个 小型Http服务，支持http和WebSocket，可以采用注解来声明Handler</p>
  </div>
  <div class="feature">
    <h2>Magician-Route</h2>
    <p>Magician-Route是由Magician-Web发展而来，主要是去掉了里面的反射，牺牲了一点易用性，将侧重点放在了性能上</p>
  </div>
  <div class="feature">
    <h2>Magician-JDBC</h2>
    <p>一个数据库操作框架，支持多数据源，事务管理，分页查询，单表操作无SQL，复杂操作可以自己写SQL，支持实体参数，支持{}和?占位符</p>
  </div>
  <div class="feature">
    <h2>&nbsp;</h2>
    <p>&nbsp;</p>
  </div>
</div>
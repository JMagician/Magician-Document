---
home: true
heroImage: https://magician-io.com/source/images/logo1.png
actionText: 文档 →
actionLink: /magic/index.md
footer: 基于MIT协议的开源项目 | QQ群：773291321 | Email - yuyemail@163.com
---

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
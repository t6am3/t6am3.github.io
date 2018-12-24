> # 机器信息

|机器名称|ip地址|节点身份|etcd|flanneld|需要安装的K8s组件|docker|
|---|---|---|---|---|---|---|
|super09|192.168.7.78|master|Y|Y|kubctl<br>kube-apiserver<br>kube-controller-manager<br>kube-scheduler|Y|
|super08|192.168.7.77|node01|Y|Y|kube-proxy<br>kubelet|Y|
|super11|192.168.7.80|node02|Y|Y|kube-proxy<br>kubelet|Y|
|super12|192.168.7.81|node03|Y|Y|kube-proxy<br>kubelet|Y|

>  super09和super08已经组成了一个集群，现在的目的是将super11 & super12加入这个集群。<br>super11与super12安装之前的状态信息如下：

|机器名称|etcd版本|etcd配置文件是否一致|flanneld版本|flanneld版本是否一致|kube-proxy|kubelet|证书配置|kube-proxy服务配置文件|kubelet配置文件|
|---|---|---|---|---|---|---|---|---|---|
|super11|v3.2.18|N|未安装|N|未安装|v1.10.0|N|无|不一致|
|super12|v3.2.18|N|未安装|N|未安装|v1.10.0|N|无|不一致|

___
> # 需要更改的文件如下：
1. 所有二进制文件，而且存放的位置不一致，应该删除放在/usr/bin下面的etcd, kube三件套，并从08节点scp所有的/opt/bin下二进制文件
2. 全局性管理文件(直接修改),Master上也需要修改：
    * /opt/config/etcd.yml(将整体的地址信息添加)
    * /lib/systemd/system/flanneld.service(将整体的地址信息添加)
    * /lib/systemd/system/kube-apiserver.service(将整体的地址信息添加)
3. 复制过来不需要更改的配置文件：
    * /lib/systemd/system/etcd.service
    * /lib/systemd/system/docker.service
    * /etc/kubernetes/kubeconfig
4. 复制过来需要修改的配置文件：
    * /opt/config/etcd.yml(将各个IP
    换成自己的)
    * /lib/systemd/system/flanned.service(将IP
    换成自己的)
    * /lib/systemd/system/kubelet.service(修改自己的IP地址)
    * /lib/systemd/system/kube-proxy.service(修改自己的IP地址)
5. 证书：
    * 重新生成并使用[二进制手工搭建k8s集群](https://t6am3.github.io/2018/12/二进制手工搭建k8s集群/)中的方法布置

> # 操作步骤
1. 关闭super11，super12的swap：  
`swapoff -a`
2. 删除super11， super12上的/usr/bin/下的etcd, kube三件套，kubelet.service
```
cd /usr/bin
sudo rm kube*
sudo rm /lib/systemd/sysmtem/kubelet.service
```
3. 修改控制全局的文件:
    * 在super09上修改/opt/config/etcd.yml:添加两台新机器的套接字
    * 在super09上修改/lib/systemd/system/flanneld.service:添加两台新机器的套接字
    * 在super09上修改/lib/systemd/system/kube-apiserver.service：添加两台新机器的套接字
    * 同样修改super08上的etcd.yml以及flanneld.service
4. 在super08(node1)上将所有的文件打包并压缩成**k8s_setup.tar.gz**：
    * /opt/bin/*
    * /opt/config/etcd.yml
    * /etc/kubernetes/kubeconfig
    * /lib/systemd/system/etcd.service & flanneld.service & docker.service & kube-proxy.service & kubelet.service
```
mkdir k8s_setup
cd k8s_setup
cp -r /opt/bin/ .
cp -r /opt/config .
mkdir service
cd service
cp /lib/systemd/system/etcd.service /lib/systemd/system/flanneld.service /lib/systemd/system/docker.service /lib/systemd/system/kube*.service .
cd ../..
tar zcvf k8s_setup.tar.gz k8s_setup
```
5. 将**k8s_setup.tar.gz**scp到super11与super12上：  
```
scp k8s_setup.tar.gz super11:/home/ivic/ 
scp k8s_setup.tar.gz super12:/home/ivic/
```  
 
> 想起应该配置一下master(super09)免密登录super11 & super12

* 在super11 & super12上安装openssh-server：  
```
sudo apt-get update
sudo apt-get install openssh-server
```
* 生成super09的密钥对：  
`ssh-keygen -t rsa`  
(由于在super09上已经有了所以我在操作时就没有生成)
* 将super09的公钥传输至super11 & super12，并加入认证
```
super09上：
cp id_rsa.pub id_rsa09.pub
scp id_rsa09.pub super11:/home/ivic/.ssh
scp id_rsa09.pub super12:/home/ivic/.ssh
super11上：cat id_rsa09.pub >> authorized_keys
super12上同
```
6. 将k8s_setup.tar.gz解压，修改并分发到相应位置：
```
sudo tar zxvf k8s_setup.tar.gz  
使用chown得到权限：
cd k8s_setup
sudo chown -R ivic *
```
修改文件：  
* k8s_setup/config/etcd.yml
* k8s_setup/service/flanned.service
* k8s_setup/service/kubelet.service
* k8s_setup/service/kube-proxy.service  

分发：
```
sudo mv bin config /opt/
sudo mv service/* /lib/systemd/system/
```

配置环境变量：
```
sudo vi /etc/profile
在最后加上：
# k8s related
export PATH=/opt/bin:$PATH
保存
source /etc/profile
```
super11 super12上都需要修改并分发  

7. 开始搭建工作  
> 1. etcd布置及验证  

* 将所有机器进入root,都`source /etc/profile`
* 关闭super08以及super09上的etcd服务：  
`systemctl stop etcd.service`
* 更改super08以及super09的/var/lib/etcd/member(删掉或者bak)  
```
cd /var/lib/etcd
mv member member.bak
```
* 启动etcd服务
```
systemctl daemon-reload
systemctl enable etcd
systemctl restart etcd.service
```
* 使用`etcdctl member list`以及`etcdctl cluster-health`确认运行状态  
查看集群状态正常，etcd布置完成。  
> 注，若一开始配置文件没有改对，如etcd.yml文件里的name没改，每次改完后都要重新按照停止etcd服务，更改member，重启服务的步骤走，否则无法同步

> 2. flanneld配置及验证
* 配置key  
在master(super09)上运行：
```
etcdctl --endpoints="http://192.168.7.78:2379,http://192.168.7.77:2379,http://192.168.7.80:2379,http://192.168.7.81:2379" mk /coreos.com/network/config \ '{"Network":"10.1.0.0/16", "Backend": {"Type": "vxlan"}}'
```
* 重启flanneld
```
systemctl daemon-reload
systemctl enable flanneld
systemctl restart flanneld
```
发现super12上的flanneld组件启动失败：
查看配置，发现docker服务需要在flanneld之间启动，而super12的docker运行不正常，则先启动super12的docker.service,具体的docker.service会在下一节讲，这里不赘述
* 验证flanneld启动成功：
---
layout: post
title:  "搭建Kubernetes集群"
---
# Author:Youfeng Liu
## Shiqing没有写清楚的地方：
# 1.安装docker-ce 17.03(按照那个命令无法安装):<br>
   在我的Ubuntu下无法使用这个命令安装
  
# 2.安装kubeadm,kubelet和kubectl的命令：<br>
  `apt-get update && apt-get install -y apt-transport-https curl` <br>
  `curl -s http://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - `<br><br>
  创建/etc/apt/sources.list.d/kubernetes.list，将下面的源加入<br>
  `deb http://apt.kubernetes.io/ kubernetes-xenial main`<br>
  `apt-get update`<br>
  `apt-get install -y kubelet=1.10.4-00 kubeadm=1.10.4-00 kubectl=1.10.4-00 kubernetes-cni`<br>
  `apt-mark hold kubelet kubeadm kubectl kubernetes-cni`<br>

# 3.主节点初始化的命令无法使用：<br>
  使用以下命令可以初始化主节点：
  `kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address={主节点IP}`

## 如何尽量不使用sudo，apt-get方式来搭建K8s集群
  


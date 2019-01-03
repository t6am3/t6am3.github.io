# 动作识别的手工特征方法：[iDT算法](https://blog.csdn.net/wzmsltw/article/details/53023363)
> iDT算法时动作识别领域中非常经典的一种算法，在深度学习应用在这个领域效果也最好。在深度学习方法发明之后，将其与这种方法结合也往往能获得更好的效果，通常会使用“My method + iDT”
___
## 背景知识
___
### 光流
光流(optical flow)是目前运动图像分析的重要方法。它指时变图像中的模式运动速度。因为在物体运动时，它在图像上对应点的亮度模式也在运动。[百度百科](https://github.com/chuckcho/iDT.git)  
> 图像亮度模式的表观运动就是光流。
___
## iDT算法
[相关博客](https://blog.csdn.net/MemoryHeroLi/article/details/82493879)
![DT算法架构图](https://img-blog.csdn.net/20180906171044792?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01lbW9yeUhlcm9MaQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)  
DT算法是指密集轨迹(Dense tranjectories)算法。它分为三个部分：  
1. 密集采样特征点
    * 将视频的每一帧图片划分为多个尺度，一般为8个空间尺度
    * 在每个尺度的图片上通过网络划分的方式密集采样特征点，网格大小通常W取5
    * 去除一些缺乏变化的无法跟踪的特征点，通过计算像素点相关矩阵的特征值，去除低于某个阈值的特征点
2. 特征点轨迹跟踪
    * 用公式计算出上个部分采样的特征点在下一帧图像的位置：<br>Pt --> Pt+1
    * 对于某一个特征点，在连续的L帧图像上的位置即构成一段轨迹(Pt, Pt+1, ……)
3. 基于轨迹的特征提取
    * 对于一个长度为L的轨迹，用一系列的位移矢量构成的一个矢量来描述，为了具有一般性，除以矢量的范式进行正则化
    * 运动/结构描述子
        * 沿着某个特征点的长度为L的轨迹，在每帧图像上取特征点周围的大小为N*N的区域，构成一个时空体(Volume)，对这个体进行一次网格划分(在时间轴和空间轴上都记性划分)
        * HOG特征:HOG特征计算的是灰度图像梯度的直方图。直方图的bin数目取为8。故HOG特征的长度为96（2*2*3*8）。
        * HOF特征:HOF计算的是光流（包括方向和幅度信息）的直方图。直方图的bin数目取为8+1，前8个bin于HOG相同，额外的一个bin用于统计光流幅度小于某个阈值的像素。故HOF的特征长度为108（2*2*3*9）。
        * MBH特征:MBH计算的是光流图像梯度的直方图，也可以理解为在光流图像上计算的HOG特征。由于光流图像包括x方向和y方向，故分别计算MBHx和MBHy。MBH总的特征长度为192（2*96）。

4. 特征编码  
使用Fisher Vector，每一段视频，存在着大量的轨迹，每段轨迹都对应着一组特征：(trajectory,HOG,HOF,MBH),对这些特征组进行编码，可以得到一个定长的编码特征来进行最后的视频分类
5. 分类  
最后使用SVM进行分类。采用SVM（RBF−χ2核）分类器进行分类，one-against-rest策略训练多类分类器。
___
## 具体实现
[iDT项目地址](https://github.com/chuckcho/iDT)
* 需要安装OpenCV以及ffmpeg  
`sudo apt install ffmpeg`  
[如何安装openCV](https://blog.csdn.net/cocoaqin/article/details/78163171)   
[make中可能出现问题的解决方法](https://www.cnblogs.com/zzx2cnblogs/p/7580107.html)(这里面选择仓库的时候_用-代替)+`sudo apt install libopencv-dev`
* 需要编译  
在README.md里有如何编译的方法  



使用该项目可以将视频转化为特征数据
  
使用python moudule：sklearn可以指定使用（RBF−χ2核）的分类器  
[sklearn的官方文档](https://scikit-learn.org/stable/modules/generated/sklearn.svm.SVC.html)  
[如何使用sklearn](https://blog.csdn.net/wonengguwozai/article/details/70215055)   
/**
 * 对于实现点击分支图上的某个node，提供跳转至该node的功能，考虑以下方式
 * 
 * 由于目前引擎的向后跳转功能基于完全分支图的邻接矩阵表示，向前跳转则依赖存档中的已游玩路径点。
 * 不妨在UserStoryMatrix的已visit点上附加存档记录。这样既可以判断这个点有没有visited，也可以即时加载数据。
 * 在玩家来到一个新点的时候后台做一次存档，把存档的object附加到UserStoryMatrix上再对矩阵做持久化。
 * 
 * 分支图那一块的节点已经写好点击事件了，在点击事件处理函数中，
 * 利用gojs的数据绑定就能把绑定在这个节点上的存档信息send给GameView加载。
 */
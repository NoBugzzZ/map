## 环境
node v14  
npm v6

## 安装依赖
```
npm install
```
## 运行
```
REACT_APP_API_URL_BACKEND=${url} npm start
```
${url}需要替换成[mapbackend](https://github.com/NoBugzzZ/mapbackend)的地址 <https://github.com/NoBugzzZ/mapbackend>

## 设置端口
.env文件设置PORT

## API设置
requests/ditto.js

# map页面
## 查找
点击查找按钮，在drawer中可选择:  
1. Type选择框，代表查找车辆
2. Editor，填写mongo查询条件，例如
```
{
    "_id":"鲁U691M9-0"
}
```

## 清除
点击清除按钮，地图上所有内容就会被删除

# gantries页面
## weight
输入导入边的权重范围(0<=weight<=1)，点击导入，耐心等待数秒。

## 实体门架
为红色点

## 虚门架
为蓝色点

## 边
透明度表示比例，颜色越深，比例越高
粗细未具体流量，线越粗，流量越高
点击可以显示具体流量数
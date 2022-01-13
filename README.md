## 环境
node v16.13.2  
npm 8.1.2

## 环境配置
|  操作系统   | 环境配置  |
|  -  | -  |
| mac  | 点击[官网安装器链接](https://nodejs.org/dist/v16.13.2/node-v16.13.2.pkg)下载安装即可 |
| 其他操作系统  | 参照[教程](https://www.runoob.com/nodejs/nodejs-install-setup.html)配置即可 |

## 安装依赖
```
npm install
```
## 运行
```
REACT_APP_API_URL_BACKEND=${url} npm start
```
${url}需要替换成[mapbackend](https://github.com/NoBugzzZ/mapbackend)的提供的API地址

例如一条完整的命令行
```
REACT_APP_API_URL_BACKEND=http://localhost:3000 npm start
```

## 设置端口
.env文件设置PORT

# vehicle页面
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

# gantry页面


## weight
输入导入边的权重范围(0<=weight<=1)，**建议**权重不要小于0.1，点击导入，耐心等待数秒。

## 实体门架
为红色点

## 虚门架
为蓝色点

## 边
**透明度**表示比例，颜色越深，比例越高  
**粗细**为具体流量，线越粗，流量越高  
点击可以显示具体流量数
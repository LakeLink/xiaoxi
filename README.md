# Cloud Dev

## Storage System

### Path

* /WeRunDetails/{WeRunDetails.Id}/img{index}: User uploaded images

## Database System

### Collections

#### WeRunDetails

* when (Date)
* likedBy (openid[])
* exerciseType (String)
* exerciseTypeId (Number)
* unit (String)
* numericData (Number)
* textContent (String)
* images (string[])
* videos (string[])

## 3rdparty 目录
因为微信不懂 npm 构建，很多包中非直接引用的文件无法使用

根据需要，从 `node_modules` 中拷贝需要的文件


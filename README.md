# Cloud Dev

## TODO

* swiper item: indicator dots style
* database schema description
* header image style
* notification
* bonus buttons

## Storage System

### Path

* /WeRunDetails/{WeRunDetails.Id}/img{index}: User uploaded images

## Database System

### Collections

#### users

* _id (openid)
* avatarUrl (string)
* bio (string)
* nickname (string)
* realname (string)
* hobby (string)
* collegeIndex (string)
* verifiedIdentity (string)
* verifiedOrganization (string)
* year (string)

#### posts

* author (openid)
* when (serverDate)
* textContent (String)
* images (string[])
* likedBy (openid[])

#### comments

* author (openid)
* parentId (string)
* when (serverDate)
* textContent (String)
* images (string[])
* likedBy (openid[])
* subComments ({author: openid, textContent: string, images: string[], when: serverDate}[])

post -> comment -> subComment

#### WeRunDetails

* when (Date)
* likedBy (openid[])
* exerciseType (String)
* exerciseTypeId (Number)
* unit (String)
* numericData (Number)
* textContent (String)
* location (string)
* images (string[])
* videos (string[])
* comments ({author: openid, content: string, when: serverDate}[])

#### werun_steps

* timestamp (Number, index, descending)
* user (openid, index)
* step (Number)

#### werun_notices

* when (serverDate)
* author (openid)
* content (string)


## 3rdparty 目录
因为微信不懂 npm 构建，很多包中非直接引用的文件无法使用

根据需要，从 `node_modules` 中拷贝需要的文件

### EChart

https://echarts.apache.org/zh/builder.html : 从这里下载裁剪版EChart

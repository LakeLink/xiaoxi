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
* publishedAt (timestamp)
* updatedAt (timestamp, milliseconds, index)
* topicValue (number, index)
* visibilityValue (number, index)
* pinned (boolean, index)
* textContent (String)
* images (string[])
* likedBy (openid[])

#### comments

* author (openid)
* parentId (string, index)
* publishedAt (timestamp)
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

#### votes

* day (timestamp)
* user (openid)
* topicIds (string[])


#### feast_canteens

* name (string)
* avatarUrl (string)

#### feast_windows

* canteenId (string)
* name (string)
* avatarUrl (string)

#### feast_foods

* windowId (string)
* name (string)
* avatarUrl (string)
* price (number)
* time (number[], 0: always, 1: breakfast, 2: lunch, 3: dinner, 4: latenight)

#### feast_ratings

* type (canteen, window, food)
* targetId (string)
* when (timestamp)
* user (openid)
* useStagename (boolean)
* stagename (string)
* textContent (String)
* images (string[])
* upVotedBy (openid[])
* downVotedBy (openid[])

if type == canteen:
* env (number)

if type == window:
* srv (number)

if type == food:
* taste (number)


#### feast_comments

* author (openid)
* parentId (string, index)
* publishedAt (timestamp)
* textContent (String)
* images (string[])


## Cloud Functions

### Timezone

TZ = Asia/Shanghai

## 3rdparty 目录
因为微信不懂 npm 构建，很多包中非直接引用的文件无法使用

根据需要，从 `node_modules` 中拷贝需要的文件

### EChart

https://echarts.apache.org/zh/builder.html : 从这里下载裁剪版EChart

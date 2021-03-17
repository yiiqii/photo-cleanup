# photo-cleanup

Use `photo-cleanup` for:

- Organize files through Model, Date and Location.
- Compare parts of data to find matches and diffs.

## Installation

Install with npm:

``` bash
$ npm i photo-cleanup -g
```

Then get the Amap key from: https://developer.amap.com/, because we will use it for locations.
Create a file which named `.amap.token` in your Home fold or the current fold, like:

``` bash
7f28387df7f2c*******4f67f7f
```

> Choose `Web服务` for the key on [Amap](https://developer.amap.com/).

## Usage

``` bash
# Organize files
$ photo-cleanup <fold> [destFold]
```

``` bash
# Compare parts
$ photo-cleanup compare <fold> [fold2]
```

## Examples

### Organize

The original photo album:
``` bash
album
├── IMG_20171109_111842.jpg
├── IMG_20181016_112552R.jpg
├── IMG_4468.JPG
├── IMG_4765.PNG
├── IMG_4841.JPG
├── IMG_7560.MOV
├── IMG_9118.HEIC
├── IMG_9119.MOV
├── VID_20171116_164327.mp4
├── ***
├── mmexport1510296824887.jpg
├── Scanned photographs
│   └── 2021-01-23_212833_13.HEIF
└── Network
    └── IMG_8061.jpeg
```

Start Organize:
``` bash
$ photo-cleanup album
[提示] Glob file count: 23
Can not recognize file type: */album/.DS_Store
[成功] */album/IMG_20171109_111842.jpg => */20210316/2017.11/HUAWEI NCE-AL00/IMG_20171109_111842.jpg
=> Loc by map [IMG_20181016_112552R.jpg]: https://amap.com/?q=39.6426340833333,105.472199166667
? Choose Loc: */album/IMG_20181016_112552R.jpg lat: 39.6426340833333 lng: 105.472199166667 (Use arrow keys)
❯ None
  Type in a name
  内蒙古自治区阿拉善盟阿拉善左旗吉兰泰镇
  阿拉善左旗=>[阿拉善盟,吉兰泰镇]
? Choose Loc: */album/IMG_20181016_112552R.jpg lat: 39.6426340833333 lng: 105.472199166667 阿拉善左旗=>[阿拉善盟,吉兰泰镇]
[成功] */album/IMG_20181016_112552R.jpg => */20210316/2018.10/2018.10.16阿拉善左旗/Smartisan U3 Pro/IMG_20181016_112552R.jpg
[成功] */album/IMG_4468.JPG => */20210316/2018.10/iPhone 7 Plus/IMG_4468.JPG
[成功] */album/IMG_4765.PNG => */20210316/2018.10/Screenshot/IMG_4765.PNG
=> Loc by map [IMG_4841.JPG]: https://amap.com/?q=39.7031111111111,105.517752777778
? Choose Loc: */album/IMG_4841.JPG lat: 39.7031111111111 lng: 105.517752777778 Type in a name
? Type in Loc: () 奥林匹克森林公园
# ...
```

The result:
``` bash
20210316
├── 2017.11
│   ├── HUAWEI NCE-AL00
│   │   └── IMG_20171109_111842.jpg
│   ├── HUAWEI RNE-AL00
│   │   └── mmexport1510296824887.jpg
│   └── VID_20171116_164327.mp4
├── 2018.10
│   ├── 2018.10.16阿拉善左旗
│   │   ├── Smartisan U3 Pro
│   │   │   └── IMG_20181016_112552R.jpg
│   │   └── iPhone 7 Plus
│   │       └── IMG_4841.JPG
│   ├── Screenshot
│   │   └── IMG_4765.PNG
│   └── iPhone 7 Plus
│       └── IMG_4468.JPG
├── 2020.01
│   └── Network
│       └── IMG_8061.jpeg
├── 2020.08
│   └── iPhone 7 Plus
│       └── IMG_7560.MOV
├── 2021.01
│   └── Scanned photographs
│       └── 2021-01-23_212833_13.HEIF
└── 2021.03
    └── 2021.03.13奥林匹克森林公园
        └── iPhone 7 Plus
            ├── IMG_9118.HEIC
            └── IMG_9119.MOV
```

### Compare

The original photo album:
``` bash
album
├── IMG_20171109_111842 copy.jpg
├── IMG_20171109_111842.jpg
├── IMG_20181016_112552R.jpg
├── IMG_4468.JPG
├── IMG_4765.PNG
├── IMG_4841.JPG
├── IMG_7560 copy.MOV
├── IMG_7560.MOV
├── IMG_9118 copy.HEIC
├── IMG_9118.HEIC
├── IMG_9119.MOV
├── VID_20171116_164327.mp4
├── mmexport1510296824887.jpg
├── Scanned photographs
│   └── 2021-01-23_212833_13.HEIF
└── Network
    └── IMG_8061.jpeg
```

Start Compare and delete the duplicate files:
``` bash
$ photo-cleanup compare album
Starting arrange files...
Starting detection...
[提示] Files Count: 22
[提示] Duplicate files Count: 3
1. Duplicate file [1ee61982477f2ff31cd124986f4fcc76]: */album/IMG_20171109_111842 copy.jpg
1. Duplicate file [1ee61982477f2ff31cd124986f4fcc76]: */album/IMG_20171109_111842.jpg
2. Duplicate file [5a267762f41c71bb297a26a80e9ceb19]: */album/IMG_7560 copy.MOV
2. Duplicate file [5a267762f41c71bb297a26a80e9ceb19]: */album/IMG_7560.MOV
3. Duplicate file [af2dd6b7e1b6e1175da6754179047508]: */album/IMG_9118 copy.HEIC
3. Duplicate file [af2dd6b7e1b6e1175da6754179047508]: */album/IMG_9118.HEIC
? Choose File to Delete[1ee61982477f2ff31cd124986f4fcc76]:  (Use arrow keys)
❯ None
  */album/IMG_20171109_111842 copy.jpg
  */album/IMG_20171109_111842.jpg
[成功] File deleted: */album/IMG_20171109_111842 copy.jpg
? Choose File to Delete[5a267762f41c71bb297a26a80e9ceb19]:  */album/IMG_7560 copy.MOV
Starting delete...
[成功] File deleted: */album/IMG_7560 copy.MOV
? Choose File to Delete[af2dd6b7e1b6e1175da6754179047508]:  */album/IMG_9118 copy.HEIC
Starting delete...
[成功] File deleted: */album/IMG_9118 copy.HEIC
Finish!
```

## License

Licensed under MIT

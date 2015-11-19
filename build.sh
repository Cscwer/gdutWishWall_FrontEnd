#!/bin/bash

rm -r /media/sibarone/文档/工作/BaiduApp/wishwall/app
cp -r src/ /media/sibarone/文档/工作/BaiduApp/wishwall
mv /media/sibarone/文档/工作/BaiduApp/wishwall/src /media/sibarone/文档/工作/BaiduApp/wishwall/app
mv /media/sibarone/文档/工作/BaiduApp/wishwall/app/index.html /media/sibarone/文档/工作/BaiduApp/wishwall/app/app.html
echo "everything is ok"


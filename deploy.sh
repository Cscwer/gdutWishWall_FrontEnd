#!/bin/bash

rm -r /media/sibarone/文档/工作/BaiduApp/appidbw3h3324s8/app
cp -r dist/ /media/sibarone/文档/工作/BaiduApp/appidbw3h3324s8
mv /media/sibarone/文档/工作/BaiduApp/appidbw3h3324s8/dist /media/sibarone/文档/工作/BaiduApp/appidbw3h3324s8/app
mv /media/sibarone/文档/工作/BaiduApp/appidbw3h3324s8/app/index.html /media/sibarone/文档/工作/BaiduApp/appidbw3h3324s8/app/app.html
echo "deploy is ok"


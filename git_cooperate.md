# git团队合作流程

## 分支

![image-20250412180155880](https://ssstone.oss-cn-beijing.aliyuncs.com/image-20250412180155880.png)

目前我们的项目有`main`和`develop`两个分支，`main`分支用来保存测试稳定的代码，大家可以在`develop`分支上自由开发

合作初期还是建议大家不要改别人的代码，我是在`develop`分支建立了一个`xgl`文件夹，用来保存我写的代码，等我测试完毕后，可以试着将我的代码`merge`到`main`分支

## develop开发

这里我给大家演示一下具体怎么进行git合作

首先要明确的是几个区域

**远程代码仓 本地代码仓 暂存区 工作区**

比如我们新建一个文件，实际上这个文件是在**工作区**

![image-20250412180936810](https://ssstone.oss-cn-beijing.aliyuncs.com/image-20250412180936810.png)

当我们执行`git add`的时候，这个文件变被放在了暂存区

![image-20250412181110856](https://ssstone.oss-cn-beijing.aliyuncs.com/image-20250412181110856.png)

这是会发现貌似`add`不`add`好像没什么区别，这里我们可以在`vscode`自带的源代码管理功能看到我们`add`的文件

![image-20250412181316637](https://ssstone.oss-cn-beijing.aliyuncs.com/image-20250412181316637.png)

蓝色圈出的文件就是刚刚创建的文件，而红色圈出的文件是我现在正在写的这个`markdown`文件，由于我没有`git add`这个`markdown`文件，所以它还在工作区

这是我们点击 “提交” 就会把我们的`git_test.txt`提交到**本地代码仓**，相当于执行了

```
git commit
```

此时会弹出一个页面让我们来写这个提交说明

![image-20250412181656176](https://ssstone.oss-cn-beijing.aliyuncs.com/image-20250412181656176.png)

这时我们点击那个 √ 号就会完成提交

这里要注意的是我们的 `develop` 分支是有本地和远程之分的，当提交之后，实际上只是改变了我们本地的`develop`分支

假设这个时候另一个同学更新的远程的`develop`分支，我们是看不到改动的，这个时候就需要我们把远程和本地同步

执行这个命令

```
git pull origin develop
```

这个命令会把远程的`develop`分支拉取下来，==同时还进行了合并（merge）操作==，把远程的`develop`分支和本地的`develop`分支合并起来了。

这个时候，如果有人对一个文件做了更改，另一个人也对同一个文件进行了更改，就会发生**冲突**现象，这也是为什么前期先不让大家改别人代码的原因

当我们的develop分支同步了之后，再执行这个命令

```
git push origin develop
```

就会成功的把我们的文件推送到`github`上

![image-20250412182633025](https://ssstone.oss-cn-beijing.aliyuncs.com/image-20250412182633025.png)
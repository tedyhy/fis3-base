// 设置项目属性
fis.set('project.name', 'fis3-base');
fis.set('project.static', '/static');
fis.set('project.files', ['client/**/*.html', 'map.json']);
fis.set('project.ignore', fis.get('project.ignore').concat([
  'server'
]));

// 引入模块化开发插件，设置规范为 commonJs 规范。
fis.hook('commonjs', {
  baseUrl: './client/modules',
  extList: ['.js']
});

// 禁用 components，使用 node_modules
fis.unhook('components')
fis.hook('node_modules')


/*************************目录规范*****************************/

// 开启同名依赖
fis.match('/client/modules/**', {
  useSameNameRequire: true
});

// 支持 node_modules
fis.match('/node_modules/**.js', {
  isMod: true,
  useSameNameRequire: true
});


// ------ 全局配置 ------
// 允许你在 js 中直接 require css及文件
fis.match('*.{js,es}', {
  preprocessor: [
    fis.plugin('js-require-file', {
      useEmbedWhenSizeLessThan: 10 * 1024 // 小于10k用base64
    }),
    fis.plugin('js-require-css', {
      mode: 'dependency'
    })
  ]
});

// 配置图片压缩
fis.match('**.png', {
  optimizer: fis.plugin('png-compressor', {
    type: 'pngquant'
  })
});


// ------ 配置 lib ------
fis.match('/client/(lib/**.js)', {
  release: '${project.static}/$1'
});

// ------ 配置 favicon.ico ------
fis.match('/client/(favicon.ico)', {
  release: '${project.static}/$1'
})

// ------ 配置 node_modules ------
fis.match('/node_modules/**', {
  release: '${project.static}/$&'
});

// ------ 配置 modules ------
fis.match('client/modules/(**)', {
  release: '${project.static}/$1'
})

// ------ 配置 css ------
fis.match('*.scss', {
  rExt: '.css',
  parser: [
    fis.plugin('node-sass', {
      include_paths: ['client/modules', 'node_modules']
    })
  ]
});
fis.match('*.less', {
  parser: fis.plugin('less', {
    paths: ['client/modules', 'node_modules']
  })
});
fis.match(/.*\.(scss|less|css)$/i, {
  rExt: '.css',
  isMod: true,
  release: '${project.static}/$&',
  postprocessor: fis.plugin('autoprefixer', {
    browsers: ['IE >= 8', 'Chrome >= 30', 'last 2 versions'] // pc
    // browsers: ['Android >= 4', 'ChromeAndroid > 1%', 'iOS >= 6'] // wap
  })
});
fis.match(/^\/client\/(.*\.(?:png|jpg|gif))$/i, {
  release: '${project.static}/$1'
});

// ------ 配置 js ------
fis.match(/^\/client\/modules\/(.*(\.es|\.js))$/i, {
  parser: fis.plugin('babel-5.x'),
  rExt: '.js',
  isMod: true,
  release: '${project.static}/$1'
});


/*************************打包规范*****************************/

// 因为是纯前端项目，依赖不能自动被加载进来，所以这里需要借助一个 loader 来完成，
// 注意：与后端结合的项目不需要此插件!!!
fis.match('::package', {
  // npm install [-g] fis3-postpackager-loader
  // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
  postpackager: fis.plugin('loader', {
    resourceType: 'commonJs',
    useInlineMap: true // 资源映射表内嵌
  })
});

// debug 后缀，不会压缩
var map = {
  'rd': {
    host: '',
    path: ''
  },
  'rd-debug': {
    host: '',
    path: ''
  },
  'prod': {
    host: '', // 如 http://yanhaijing.com',
    path: '', // '/${project.name}'
  },
  'prod-debug': {
    host: '',
    path: ''
  }
};

// 通用 1.替换 url 前缀 2.添加 md5 码 3.打包 4.合图 5.重新定义资源路径
Object.keys(map).forEach(function(v) {
  var o = map[v];
  var domain = o.host + o.path;

  fis.media(v)
    .match('**.{es,js}', {
      useHash: true,
      domain: domain
    })
    .match('**.{scss,less,css}', {
      useSprite: true,
      useHash: true,
      domain: domain
    })
    .match('::image', {
      useHash: true,
      domain: domain
    })
    .match('**/(*_{x,y,z}.png)', {
      release: '/pkg/$1'
    })
    // 启用打包插件，必须匹配 ::package
    .match('::package', {
      spriter: fis.plugin('csssprites', {
        layout: 'matrix',
        margin: '10'
      }),
      postpackager: fis.plugin('loader', {
        allInOne: true,
      })
    })
    .match('/lib/es5-{shim,sham}.js', {
      packTo: '/pkg/es5-shim.js'
    })
    .match('/node_modules/**.css', {
      packTo: '/pkg/node_modules.css'
    })
    .match('/node_modules/**.js', {
      packTo: '/pkg/node_modules.js'
    })
    .match('/modules/**.{scss,less,css}', {
      packTo: '/pkg/modules.css'
    })
    .match('/modules/css/**.{scss,less,css}', {
      packTo: ''
    })
    .match('/modules/css/common.scss', {
      packTo: '/pkg/common.css'
    })
    .match('/modules/**.{es,js}', {
      packTo: '/pkg/modules.js'
    })
    .match('/modules/app/**.{es,js}', {
      packTo: '/pkg/aio.js'
    })
});


// 压缩css js html
Object.keys(map)
  .filter(function(v) {
    return v.indexOf('debug') < 0
  })
  .forEach(function(v) {
    fis.media(v)
      .match('**.{es,js}', {
        optimizer: fis.plugin('uglify-js')
      })
      .match('**.{scss,less,css}', {
        optimizer: fis.plugin('clean-css', {
          'keepBreaks': true // 保持一个规则一个换行
        })
      });
  });

// 本地产出发布
fis.media('prod')
  .match('**', {
    deploy: [
      fis.plugin('skip-packed', {
        // 默认被打包了 js 和 css 以及被 css sprite 合并了的图片都会在这过滤掉，
        // 但是如果这些文件满足下面的规则，则依然不过滤
        ignore: []
      }),

      fis.plugin('local-deliver', {
        to: 'dist'
      })
    ]
  });
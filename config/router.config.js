export default [
  {
    path: '/user',
    component: '../layouts/LoginLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './Login' },
    ],
  },
  {
    path: '/',
    component: '../layouts/AuthLayout',
    routes: [
      { path: '/dashboard', component: './Dashboard' },
      {
        path: "/backConfig",
        name: "backConfig",
        routes: [
          { path: "/backConfig/widgetType", component: "./BackConfig/WidgetType" },
          { path: "/backConfig/widgetProducer", component: "./BackConfig/WidgetProducer" },
        ]
      },
      {
        path: "/portal",
        name: "portal",
        routes: [
          { path: "/portal/home", component: "./Portal/Home" },
        ]
      }
    ],
  },
];


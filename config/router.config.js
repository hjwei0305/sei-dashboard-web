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
          { path: "/backConfig/demo", component: "./BackConfig" },
        ]
      },
      {
        path: "/dashboard",
        name: "dashboard",
        routes: [
          { path: "/dashboard/portalHome", component: "./Portal/Home" },
        ]
      }
    ],
  },
];


import { createRouter, createWebHistory } from "vue-router";

const Auth = () => import("./views/auth/Auth.vue");
const AppLayout = () => import("./layouts/AppLayout.vue");
const AdminLayout = () => import("./layouts/AdminLayout.vue");

// pages kept per requirement
const HealthNews = () => import("./views/news/HealthNews.vue");
const NewsDetail = () => import("./views/news/NewsDetail.vue");
const NewsEdit = () => import("./views/news/NewsEdit.vue");
const Recipes = () => import("./views/recipes/Recipes.vue");
const RecipeDetail = () => import("./views/recipes/RecipeDetail.vue");
const RecipeEdit = () => import("./views/recipes/RecipeEdit.vue");
const HealthConsult = () => import("./views/health/HealthModel.vue");
const HealthRecord = () => import("./views/health/HealthRecord.vue");
const Profile = () => import("./views/profile/Profile.vue");
const Favorites = () => import("./views/profile/Favorites.vue");
const ApiTest = () => import("./views/ApiTest.vue");

// admin pages
const Dashboard = () => import("./views/admin/Dashboard.vue");
const AdminManage = () => import("./views/admin/AdminManage.vue");
const UserManage = () => import("./views/admin/UserManage.vue");
const RecipeManage = () => import("./views/admin/RecipeManage.vue");
const NewsManage = () => import("./views/admin/NewsManage.vue");

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: Auth },
  { path: "/register", name: "register", component: Auth },
  { path: "/api-test", name: "api-test", component: ApiTest },
  {
    path: "/app",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/app/news" },
      { path: "news", name: "news", component: HealthNews, meta: { title: "健康资讯" } },
      { path: "news/:id", name: "news-detail", component: NewsDetail, meta: { title: "资讯详情" } },
      { path: "recipes", name: "recipes", component: Recipes, meta: { title: "食谱" } },
      { path: "recipes/:id", name: "recipe-detail", component: RecipeDetail, meta: { title: "食谱详情" } },
      { path: "recipes/new", name: "recipe-new", component: RecipeEdit, meta: { title: "发布食谱" } },
      { path: "news/new", name: "news-new", component: NewsEdit, meta: { title: "发布资讯" } },
      { path: "health-consult", name: "health-consult", component: HealthConsult, meta: { title: "健康咨询" } },
      { path: "health-record", name: "health-record", component: HealthRecord, meta: { title: "健康记录" } },
      { path: "profile", name: "profile", component: Profile, meta: { title: "个人中心" } },
      { path: "favorites", name: "favorites", component: Favorites, meta: { title: "我的收藏" } },
    ],
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      { path: "dashboard", name: "admin-dashboard", component: Dashboard, meta: { title: "数据概览" } },
      { path: "admins", name: "admin-admins", component: AdminManage, meta: { title: "管理员管理" } },
      { path: "users", name: "admin-users", component: UserManage, meta: { title: "用户管理" } },
      { path: "recipes", name: "admin-recipes", component: RecipeManage, meta: { title: "食谱管理" } },
      { path: "news", name: "admin-news", component: NewsManage, meta: { title: "资讯管理" } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  
  // 管理后台权限检查
  if (to.meta?.requiresAdmin && !adminToken) {
    return { name: "login" };
  }
  
  // 普通用户权限检查
  if (to.meta?.requiresAuth && !token) {
    return { name: "login" };
  }
  
  // 已登录用户访问登录页
  if ((to.name === "login" || to.name === "register") && (token || adminToken)) {
    return adminToken ? { path: "/admin/dashboard" } : { path: "/app/news" };
  }
});

export default router;


import React from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import AuthWrapper from "./components/AuthWrapper";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Places from "./pages/Places";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import ProductForm from "./pages/ProductForm";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Config from "./pages/config";
import Admin from "./pages/Admin";
import AdminPlaces from "./pages/AdminPlaces";
import AdminEvents from "./pages/AdminEvents";
import AdminNews from "./pages/AdminNews";
import AdminCategories from "./pages/AdminCategories";
import AdminSistema from "./pages/AdminSistema";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound"; 
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import UserProducts from "./pages/UserProducts";
import NewsDetails from "./pages/NewsDetails";
import Posts from "./pages/Posts";
import PostForm from "./pages/PostForm";
import PostDetails from "./pages/PostDetails";
import Menu from "./pages/Menu";
import Search from "./pages/Search";
import StoryForm from "./pages/StoryForm";
import StoryViewer from "./pages/StoryViewer";
import StoryManager from "./pages/StoryManager";
import StoryCreator from "./pages/StoryCreator"; 
import Followers from "./pages/Followers";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthWrapper>
                <Routes>
                  <Route path="/" element={<Posts />} />
                  <Route path="/noticias" element={<Index />} />
                  <Route path="/eventos" element={<Events />} />
                  <Route path="/lugares" element={<Places />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/products/new" element={<ProductForm />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/perfil" element={<Profile />} />
                  <Route path="/perfil/:username" element={<UserProfile />} />
                  <Route path="/config" element={<Config />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/admin" element={<Admin />}>    
                    <Route path="lugares" element={<AdminPlaces />} />
                    <Route path="eventos" element={<AdminEvents />} />
                    <Route path="noticias" element={<AdminNews />} />
                    <Route path="categorias" element={<AdminCategories />} />
                    <Route path="sistema" element={<AdminSistema />} />
                  </Route> 
                  <Route path="/user-products" element={<UserProducts />} />
                  <Route path="/noticias/:id" element={<NewsDetails />} />
                  <Route path="/posts/:id" element={<PostDetails />} />
                  <Route path="/posts/new" element={<PostForm />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/search" element={<Search />} />
                  
                  {/* Rotas para stories */}
                  <Route path="/story/new" element={<StoryForm />} />
                  <Route path="/story/view/:userId" element={<StoryViewer />} />
                  <Route path="/story/manage" element={<StoryManager />} />
                  <Route path="/story/creator" element={<StoryCreator />} />
                  
                  {/* Rotas para seguidores */}
                  <Route path="/seguidores" element={<Followers />} />
                  <Route path="/seguidores/followers" element={<Followers />} />
                  <Route path="/seguidores/following" element={<Followers />} />
                  <Route path="/seguidores/:username" element={<Followers />} />
                  <Route path="/seguidores/:username/:tab" element={<Followers />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthWrapper>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;

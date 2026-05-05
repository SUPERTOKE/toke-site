import { createApp } from 'vue'
import './style.css'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './Views/Home.vue'
import SolanaWallets from "solana-wallets-vue"
import "solana-wallets-vue/styles.css"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets"

const walletOptions = {
    wallets: [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
    ],
    autoConnect: true,
};

const routes = [
    { path: '/', component: Home },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App)
  .use(router) 
  .use(SolanaWallets, walletOptions)
  .mount("#app");

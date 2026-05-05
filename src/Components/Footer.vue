<script setup>
import { onMounted, ref } from 'vue'

const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
        const navbarHeight = 42;
        const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
    }
};
</script>

<template>
    <div class="relative bg-neutral-950 z-50 overflow-hidden">
        <!-- Decorative elements -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>

        <footer class="relative container mx-auto px-6 py-16">
            <!-- Main content -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <!-- Left side - Logo and Brand -->
                <div class="lg:col-span-4">
                    <div class="flex items-center space-x-4">
                        <img src="../assets/logo.png" class="h-16 rounded-full hover:scale-105 transition-transform duration-300" />
                        <div class="h-12 w-px bg-gradient-to-b from-transparent via-neutral-700 to-transparent"></div>
                        <div>
                            <h3 class="font-orbitron text-xl text-white font-bold">$TOKE</h3>
                            <p class="text-neutral-400 font-exo">McToken</p>
                        </div>
                    </div>
                </div>

                <!-- Middle - Navigation Links -->
                <div class="lg:col-span-5">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <!-- Token Links -->
                        <div class="space-y-2">
                            <h4 class="font-orbitron text-sm text-neutral-300 mb-3">Token</h4>
                            <div class="space-y-2">
                                <a href="https://coinmarketcap.com/currencies/mctoken" target="_blank" class="block text-neutral-400 hover:text-white transition-colors duration-300">CoinMarketCap</a>
                                <a href="https://jup.ag/swap/SOL-TOKE" target="_blank" class="block text-neutral-400 hover:text-white transition-colors duration-300">Jupiter</a>
                                <a href="https://birdeye.so/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo?chain=solana" target="_blank" class="block text-neutral-400 hover:text-white transition-colors duration-300">Birdeye</a>
                                <a href="https://solscan.io/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo" target="_blank" class="block text-neutral-400 hover:text-white transition-colors duration-300">Solscan</a>
                            </div>
                        </div>

                        <!-- Ecosystem Links -->
                        <div class="space-y-2">
                            <h4 class="font-orbitron text-sm text-neutral-300 mb-3">Ecosystem</h4>
                            <div class="space-y-2">
                                <a href="https://explorer.mctoken.xyz/" class="block text-neutral-400 hover:text-white transition-colors duration-300">Explorer</a>
                                <a href="https://wheel.mctoken.xyz/" target="_blank" class="block text-neutral-400 hover:text-white transition-colors duration-300">App</a>
                                <a href="https://mctoken.shop/" target="_blank" class="block text-neutral-400 hover:text-white transition-colors duration-300">Shop</a>
                            </div>
                        </div>

                        <!-- Projects Links -->
                        <div class="space-y-2">
                            <h4 class="font-orbitron text-sm text-neutral-300 mb-3">Projects</h4>
                            <div class="space-y-2">
                                <a href="https://app.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD/treasury/v2" class="block text-neutral-400 hover:text-white transition-colors duration-300">McVault</a>
                                <a href="https://app.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD" class="block text-neutral-400 hover:text-white transition-colors duration-300">Realms DAO</a>
                                <a href="https://app.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD/proposal/9VzHbqA9WoiXnyw1DxBT9oDW6RTUcaEgU9gpPgCM3qJ5" class="block text-neutral-400 hover:text-white transition-colors duration-300">1st Results</a>
                                <a href="https://app.realms.today/dao/BEmzTQaiwyj69uvxmdL9fSEuETg9vsVrRDAkmDE1HWTD/proposal/GHq9epLWw5823Pwr8XGHmD6esrAq5FVzpaToYC1KxKKS" class="block text-neutral-400 hover:text-white transition-colors duration-300">2nd Results</a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right side - Social and Copyright -->
                <div class="lg:col-span-3 flex flex-col items-end justify-end space-y-6">
                    <!-- Social links -->
                    <div class="flex items-center space-x-6">
                        <a href="https://twitter.com/TokeCommunity" 
                           target="_blank"
                           class="group relative p-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                            <div class="absolute inset-0 bg-blue-500/10 rounded-xl blur-md group-hover:bg-blue-500/20 transition-all duration-300"></div>
                            <img src="../assets/x.png" class="relative h-5 invert" />
                        </a>
                        <a href="https://discord.gg/TokeCommunity" 
                           target="_blank"
                           class="group relative p-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                            <div class="absolute inset-0 bg-indigo-500/10 rounded-xl blur-md group-hover:bg-indigo-500/20 transition-all duration-300"></div>
                            <img src="../assets/discord.webp" class="relative h-5" />
                        </a>
                    </div>

                    <p class="text-neutral-500 font-exo text-sm">
                        Copyright © 2024 - All rights reserved
                    </p>
                </div>
            </div>
        </footer>

        <!-- GSTAX Tag -->
        <div class="absolute bottom-0 right-0 p-2">
            <a href="https://gstaxdigital.com" 
               target="_blank" 
               rel="noopener noreferrer"
               class="group flex items-center space-x-1 italic text-[10px] text-neutral-400 hover:text-neutral-300 transition-all duration-300">
                <img src="../assets/gstax.png" class="h-3 invert group-hover:scale-110 transition-transform duration-300" alt="GSTAX" />
                <span class="pr-2">Built By: <span class="font-bold">GSTAX</span></span>
            </a>
        </div>
    </div>
</template>

<style scoped>
.backdrop-blur-xl {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
</style>
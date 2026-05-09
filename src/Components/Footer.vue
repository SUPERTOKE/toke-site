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

        <footer class="relative container mx-auto px-4 sm:px-6 py-16">
            <!-- Main content -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <!-- Left side - Logo and Brand -->
                <div class="lg:col-span-3">
                    <div class="flex items-center space-x-4 font-orbitron">
                        <img src="../assets/logo.png" class="h-12 rounded-full hover:scale-105 transition-transform duration-300" />
                        <div class="h-9 w-px bg-gradient-to-b from-transparent via-neutral-700 to-transparent hidden md:block"></div>
                        <div class="hidden md:flex flex-col">
                            <p class="text-xl tracking-wider text-white">TOKE</p>
                            <p class="text-xs tracking-wider -mt-1 text-neutral-400">McToken</p>
                        </div>
                    </div>
                </div>

                <!-- Middle - Navigation Links -->
                <div class="lg:col-span-6">
                    <div class="grid grid-cols-1 gap-8">
                        <!-- Official Links -->
                        <div class="space-y-2">
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10">
                                <div class="space-y-2">
                                    <h4 class="font-orbitron text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-neutral-200 mb-2">Trade</h4>
                                    <a href="https://jup.ag/tokens/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo" target="_blank" class="block text-sm text-neutral-400 hover:text-white transition-colors duration-300">Jupiter</a>
                                    <a href="https://www.coinbase.com/price/mctoken-solana-amgumqeqw8h74trc8ukkjzzwtxbdps496wh4gly2mcpo-token" target="_blank" class="block text-sm text-neutral-400 hover:text-white transition-colors duration-300">Coinbase</a>
                                </div>
                                <div class="space-y-2">
                                    <h4 class="font-orbitron text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-neutral-200 mb-2">Platforms</h4>
                                    <a href="https://birdeye.so/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo?chain=solana" target="_blank" class="block text-sm text-neutral-400 hover:text-white transition-colors duration-300">Birdeye</a>
                                    <a href="https://coinmarketcap.com/currencies/mctoken" target="_blank" class="block text-sm text-neutral-400 hover:text-white transition-colors duration-300">CoinMarketCap</a>
                                    <a href="https://dexscreener.com/solana/6cvmwwp6gmz697wyx9jedhu6mxey8hv5ct8bhjnvdcwg" target="_blank" class="block text-sm text-neutral-400 hover:text-white transition-colors duration-300">Dexscreener</a>
                                </div>
                                <div class="space-y-2">
                                    <h4 class="font-orbitron text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-neutral-200 mb-2">Explorers</h4>
                                    <a href="https://orbmarkets.io/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo" target="_blank" class="block text-sm text-neutral-400 hover:text-white transition-colors duration-300">Orb</a>
                                    <a href="https://solscan.io/token/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo" target="_blank" class="block text-sm text-neutral-400 hover:text-white transition-colors duration-300">Solscan</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right side - Social and Copyright -->
                <div class="lg:col-span-3 flex flex-col items-start lg:items-end justify-end space-y-6">
                    <!-- Social links -->
                    <div class="flex items-center space-x-4 sm:space-x-6">
                        <a href="https://verified.jup.ag/dashboard/AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo" 
                           target="_blank"
                           class="group relative p-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                            <div class="absolute inset-0 bg-blue-500/10 rounded-xl blur-md group-hover:bg-blue-500/20 transition-all duration-300"></div>
                            <img src="../assets/x.png" class="relative h-5 invert" />
                        </a>
                        <a href="https://discord.com/invite/gTYuUCthvC" 
                           target="_blank"
                           class="group relative p-3 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-xl transition-all duration-300">
                            <div class="absolute inset-0 bg-indigo-500/10 rounded-xl blur-md group-hover:bg-indigo-500/20 transition-all duration-300"></div>
                            <img src="../assets/discord.webp" class="relative h-5" />
                        </a>
                    </div>

                    <p class="text-neutral-500 font-exo text-sm text-left lg:text-right">
                        Copyright © 2026 - All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.backdrop-blur-xl {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
</style>
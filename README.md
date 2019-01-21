# Decentralized Identity Verifier (In progress)

This project is a response to the [Ardor Online Hackathon](https://www.jelurida.com/ardor-hackathon-2018) and it deals with the Identity Verification Challenge.

# Pain points of a pure decentralized world
The contract is designed to help users to verify their identity and increase their trustworthiness.
Indeed, in a decentralized world all crypto accounts (bitcoin account, ardor account, etheruem account...) are anonymous and this can be a problem for many users who want to interact with others, especially when it comes to send them cryptocurrencies(money). We all recall when that some ICOs websites got hacked and the wallet address has been changed without any way for the users to know if they can trust the wallet address or not!

This application, leveraging Ardor smart contracts, aims at filling this gap by providing a solution where the holder of a wallet address (an ICO founder, an e-Commerce marchant, an Social Media influencer...) can link his wallet address with his true identities (social media account, e-commerce account, email account, phone number, ...). In this way, the other users can simply use the application by providing it with the holder account and they can immedially see which real world accounts are associated to it, and if it really belongs to the preclamed holder, they can trust it and enter into relation with it.

# Demo Application

You can find a demo of the app in this youtube video (*I will try to upload a new one with more technical details later*)

<div style="text-align:center">

[![Identity Verifier app](https://img.youtube.com/vi/86HYlgWk7aU/0.jpg)](https://www.youtube.com/watch?v=86HYlgWk7aU)

</div>

# LightWeight smart Contract

The contract is build using Java language and is located in the `contracts` folder.
The contract has been deployed on Ardor TestNet by account: ARDOR-HWZW-5TT6-U68F-H26L8 as a data file with [This Transaction](https://test.ardorportal.org/transactions/fullHash/8b06dcaa644a98ad9fedcda9e546c2ad5263acceeb3b42074d0feb9763bb9316/chain/2)

# Web application

This repo represents the web application that manages the interactions with Ardor blockchain and particularly the IdentityVerifier contract.

When you clone this repo for the first time, please ensure to run `npm install` command in order to det all the dependencies.

## Build the application

Run `ng serve` to build the project and serve in the browser at http://localhost:4200.

*During the build process, you may encounter an issue with Angular saying that it can't find the Crypto module. This is a known issue with Angular build when it comes to using Node packages. In order to solve this please go to:
<RepoFolder>\node_modules\@angular-devkit\build-angular\src\angular-cli-files\models\webpack-configs\browser.js
and replace `node: false,`  with the following line:*

` node: { crypto: true},`

# Further help

To get more help on how this web app work or on the contract, please send message on twitter @aajaji_m.

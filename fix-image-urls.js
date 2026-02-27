/**
 * Script to fix image URLs in the database
 * This replaces the old domain with the new local IP address
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/ShopApp';

// Old and new URLs
const OLD_URL = 'https://chatapi.blockyfy.com/';
const NEW_URL = 'http://192.168.18.32:3101/';

async function fixImageUrls() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Fix Product images
    console.log('\n📦 Fixing Product image URLs...');
    const productsCollection = db.collection('products');
    
    const products = await productsCollection.find({}).toArray();
    console.log(`   Found ${products.length} products`);

    let productUpdated = 0;
    for (const product of products) {
      let needsUpdate = false;
      const updates = {};

      // Fix images array
      if (product.images && Array.isArray(product.images)) {
        const fixedImages = product.images.map(img => {
          if (img && img.includes(OLD_URL)) {
            needsUpdate = true;
            return img.replace(OLD_URL, NEW_URL);
          }
          return img;
        });
        if (needsUpdate) {
          updates.images = fixedImages;
        }
      }

      // Fix video URL
      if (product.video && product.video.includes(OLD_URL)) {
        updates.video = product.video.replace(OLD_URL, NEW_URL);
        needsUpdate = true;
      }

      if (needsUpdate) {
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: updates }
        );
        productUpdated++;
        console.log(`   ✅ Updated product: ${product.name}`);
      }
    }
    console.log(`   📊 Total products updated: ${productUpdated}`);

    // Fix Shop images
    console.log('\n🏪 Fixing Shop image URLs...');
    const shopsCollection = db.collection('shops');
    
    const shops = await shopsCollection.find({}).toArray();
    console.log(`   Found ${shops.length} shops`);

    let shopsUpdated = 0;
    for (const shop of shops) {
      let needsUpdate = false;
      const updates = {};

      if (shop.profileImage && shop.profileImage.includes(OLD_URL)) {
        updates.profileImage = shop.profileImage.replace(OLD_URL, NEW_URL);
        needsUpdate = true;
      }

      if (shop.coverImage && shop.coverImage.includes(OLD_URL)) {
        updates.coverImage = shop.coverImage.replace(OLD_URL, NEW_URL);
        needsUpdate = true;
      }

      if (needsUpdate) {
        await shopsCollection.updateOne(
          { _id: shop._id },
          { $set: updates }
        );
        shopsUpdated++;
        console.log(`   ✅ Updated shop: ${shop.shopName}`);
      }
    }
    console.log(`   📊 Total shops updated: ${shopsUpdated}`);

    // Fix User images
    console.log('\n👤 Fixing User image URLs...');
    const usersCollection = db.collection('users');
    
    const users = await usersCollection.find({}).toArray();
    console.log(`   Found ${users.length} users`);

    let usersUpdated = 0;
    for (const user of users) {
      let needsUpdate = false;
      const updates = {};

      if (user.profilePic && user.profilePic.includes(OLD_URL)) {
        updates.profilePic = user.profilePic.replace(OLD_URL, NEW_URL);
        needsUpdate = true;
      }

      if (user.pic && user.pic.includes(OLD_URL)) {
        updates.pic = user.pic.replace(OLD_URL, NEW_URL);
        needsUpdate = true;
      }

      if (needsUpdate) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updates }
        );
        usersUpdated++;
        console.log(`   ✅ Updated user: ${user.email}`);
      }
    }
    console.log(`   📊 Total users updated: ${usersUpdated}`);

    console.log('\n✅ All done! Image URLs have been fixed.');
    console.log(`\n📝 Summary:`);
    console.log(`   Products: ${productUpdated} updated`);
    console.log(`   Shops: ${shopsUpdated} updated`);
    console.log(`   Users: ${usersUpdated} updated`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
fixImageUrls();


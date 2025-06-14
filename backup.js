import express from 'express';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Events,
  EmbedBuilder,
  GatewayIntentBits,
  REST,
  Routes
} from 'discord.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Bot is Working!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Define the commands
const commands = [{
    name: 'menu',
    description: 'Random Food🍕',
  },
  {
    name: 'dessert-menu',
    description: 'Random Dessert🥞',
  },
  {
    name: 'event',
    description: '📅 ดูกิจกรรมจาก Google Calendar'
  },
  {
    name: 'yen-to-thb',
    description: 'แปลงค่าเงิน เยน เป็น บาท',
    options: [
      {
        name: 'amount',
        type: 10, // TYPE_NUMBER
        description: 'จำนวนเงินเยนที่ต้องการแปลง',
        required: true
      }
    ]
  }
];

// Register commands using REST API
const rest = new REST({
  version: '10'
}).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Register commands to the Discord API
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Initialize the client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Define the menus
const menu = [
  "ข้าวผัด", "ผัดกะเพรา", "ผัดกะเพรากุ้ง", "ผัดผักบุ้ง", "ไข่เจียว",
  "ลาบหมู", "น้ำตกหมู", "ไข่พะโล้", "เบอร์เกอร์", "พิซซ่า",
  "หมูกรอบผัดพริกเกลือ", "ไก่ทอด", "ราเมง", "ไข่ดาว",
  "KFC", "McDonalds", "Nobicha", "กุ้งอบวุ้นเส้น", "ไข่กระทะ",
  "ข้าวมันไก่", "พาสต้า", "สปาเก็ตตี้คาโบนารา", "สปาเก็ตตี้ผัดขี้เมา",
  "ส้มตำ", "คัตสึด้ง", "ลาซานญ่า", "ทงคัตสึ", "เกี้ยวซ่า",
  "ทาโกะยากิ", "กุ้งเทมปุระ", "ยากิโทริ", "ข้าวขาหมู", "ข้าวแกงกะหรี่",
  "ข้าวหมูแดง", "บะหมี่เกี๊ยว", "ยำวุ้นเส้น", "ปูผัดผงกระหรี่",
  "ต้มยำกุ้ง", "หมูสะเต๊ะ", "ขนมจีน", "ข้าวเหนียวหมูปิ้ง", "ข้าวเกรียบปากหม้อ",
  "ก๋วยเตี๋ยวเรือ", "ข้าวต้ม", "ข้าวพัซซ่า", "ทาร์ตไข่", "ขนมเบื้อง",
  "พิซซ่าหน้าปู", "ข้าวสวย", "กุ้งอบซอส", "ทอดมันปลากราย", "ข้าวผัดปู",
  "สเต๊กเนื้อ", "ชาบู", "ไก่ผัดพริกขี้หนู", "เกาเหลา", "ข้าวผัดกุ้ง",
  "เนื้อย่าง", "หมูย่าง", "ไส้กรอก", "เกาเหลาหมู", "ข้าวคลุกกะปิ",
  "สลัด", "สเต๊กหมู", "แฮมเบอร์เกอร์", "ไก่กรอบ", "แซนด์วิช",
  "คาโบนาร่า", "กุ้งเผา", "ขนมจีนน้ำยา", "ข้าวเกรียบ", "ไข่เจียวหมูสับ",
  "กะเพราหมู", "กะเพราหมูสับ", "ข้าวขาหมู", "ก๋วยจั๊บ", "ผัดไท",
  "หมูชุปแป้งทอด", "กุ้งผัดพริกขี้หนู", "หมูย่างเกาหลี", "สลัดผลไม้",
  "ข้าวผัดสับปะรด", "หมูหัน", "แกงเขียวหวาน", "ข้าวหมูปิ้ง", "ปีกไก่ทอด",
  "ข้าวซอย", "ข้าวต้มปลา", "หมูกรอบ", "ข้าวมันไก่ทอด", "ต้มข่าไก่",
  "ต้มยำปลากระพง", "ลาบไก่", "มักกะโรนี", "หมูปิ้ง", "เนื้อย่าง",
  "ข้าวพะแนง", "ข้าวราดแกง", "ก๋วยเตี๋ยวคั่วไก่", "ก๋วยเตี๋ยวหมู", "ผัดเส้นหมี่",
  "ส้มตำปูปลาร้า", "ข้าวห่อใบบัว", "ยำกุ้งสด", "ไก่ย่าง", "ทอดมันกุ้ง",
  "ข้าวกล่อง", "ข้าวขาหมูโบราณ", "บาร์บีคิว", "หมูตุ๋น", "ไก่ทอดกรอบ",
  "ก๋วยเตี๋ยวต้มยำ", "น้ำพริกปลาทู", "แกงเผ็ดไก่",
  "น้ำตกเนื้อ", "สตูว์เนื้อ", "ไข่ต้ม", "สลัดกุ้ง", "ข้าวผัดกุ้ง",
  "ข้าวปลา", "สตูว์ไก่", "ผัดซีอิ๊ว", "ข้าวพริกหยวก",
  "สลัดปลาแซลมอน", "บะหมี่ไข่", "ข้าวมันไก่ทอดเกาหลี", "ข้าวผัดไข่เค็ม"
];

const dessertMenu = [
  "บิงซูสตรอว์เบอรรี", "บิงซูมะม่วง", "บิงซูแตงโม", "บิงซูเมลอน",
  "บิงซูชาเขียว", "บราวนี่", "คุ้กกี้", "เค้กส้ม", "เค้กช็อกโกแลต",
  "เค้กกาแฟ", "เค้กสตรอว์เบอร์รี", "ขนมจีบ", "ทาร์ตไข่", "ครัวซองต์",
  "โดนัท", "คัพเค้ก", "ไอศกรีม", "ขนมเบื้อง", "ช็อกโกแลตฟองดู",
  "พายแอปเปิ้ล", "ชีสเค้ก", "คุกกี้ช็อกโกแลตชิป", "พุดดิ้ง",
  "มูสมะม่วง", "เครปเค้ก", "มัฟฟิน", "ช็อกโกแลตมูส", "ไอศกรีมชาเขียว",
  "วาฟเฟิล", "เครป", "ไอศกรีมสตรอว์เบอร์รี", "คัสตาร์ด", "พายเลมอน",
  "พายสตรอว์เบอร์รี", "คัพเค้กช็อกโกแลต", "บานอฟฟี่พาย", "พายมะพร้าว",
  "พายฟักทอง", "ชีสเค้กสตรอว์เบอร์รี", "เบเกอรี่", "เค้กมะพร้าว",
  "เค้กบลูเบอร์รี", "เค้กวนิลลา", "พายส้ม", "โรลเค้ก", "ไอศกรีมผลไม้",
  "พัฟแป้ง", "ครีมบรูเล่", "โฟลต", "มิลค์เชค", "ฮันนี่โทสต์", "ทาร์ตมะพร้าว",
  "ช็อกโกแลตเค้ก", "เค้กมะม่วง", "คุ้กกี้เนย", "เค้กมะพร้าวน้ำหอม",
  "บัตเตอร์เค้ก", "บราวนี่ช็อกโกแลต", "คุกกี้โอ๊ต", "เค้กส้มโอ",
  "ไอศกรีมโกโก้", "เค้กมะนาว", "เค้กกาแฟมอคค่า",
  "ทองหยอด", "ลอยแก้ว", "บัวลอย",
  "กล้วยทอด", "เผือกทอด", "ทับทิมกรอบ", "ฝอยทอง",
  "ขนมปังเนย", "เค้กงาดำ", "คุกกี้ข้าวโอ๊ต", "สตรอว์เบอร์รีชีสเค้ก",
  "ไอศกรีมกะทิ", "ลูกชุบ", "เค้กฟรุ๊ตเค้ก",
  "เค้กนมสด", "ขนมปังสังขยา",
];


// Client Ready Event
client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);

  readyClient.user.setActivity('รอรับคำสั่งจาก User', {
    type: 3
  });
});


// Interaction Create Event
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'menu') {
    client.user.setActivity('สุ่มเมนูอาหาร', {
      type: 0
    });
    const food = menu[Math.floor(Math.random() * menu.length)];
    await interaction.reply(`🍽️ เมนู : **${food}**`);
    // กลับสู่สถานะเดิม
    setTimeout(() => {
      client.user.setActivity('รอรับคำสั่งจาก User', {
        type: 3
      });
    }, 3000);
  }

  if (interaction.commandName === 'dessert-menu') {
    client.user.setActivity('สุ่มเมนูขนมหวาน', {
      type: 0
    });
    const dessert = dessertMenu[Math.floor(Math.random() * dessertMenu.length)];
    await interaction.reply(`🍰 เมนูขนมหวาน : **${dessert}**`);
    // กลับสู่สถานะเดิม
    setTimeout(() => {
      client.user.setActivity('รอรับคำสั่งจาก User', {
        type: 3
      });
    }, 3000);
  }

  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'event') {
    client.user.setActivity('กิจกรรม', {
      type: 3
    });
    const calendarId = process.env.CALENDAR_ID;
    const apiKey = process.env.GOOGLE_API_KEY;
    const timeMin = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=50`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      return interaction.reply('📭 ไม่มีกิจกรรมที่กำลังจะมาถึง');
    }

    // แบ่งรายการเป็นกลุ่มละ 5
    const events = data.items;
    const pages = Math.ceil(events.length / 5);
    let currentPage = 0;

    const getEmbed = (page) => {
      const embed = new EmbedBuilder()
        .setTitle('📅 กิจกรรมจาก Google Calendar')
        .setColor('#00AAFF')
        .setFooter({
          text: `หน้าที่ ${page + 1} จาก ${pages}`
        })
        .setTimestamp();

      const slice = events.slice(page * 5, page * 5 + 5);
      slice.forEach((event) => {
        const name = event.summary || 'ไม่มีชื่อกิจกรรม';

        // เช็คว่ากิจกรรมเป็นแบบทั้งวันหรือไม่
        const isAllDay = !!event.start.date && !event.start.dateTime;

        let startFormatted;
        let endFormatted = '';

        if (isAllDay) {
          // ถ้าทั้งวัน แสดง "ทั้งวัน"
          startFormatted = 'ทั้งวัน';
        } else {
          // ถ้าไม่ใช่ทั้งวัน แสดงวันที่และเวลาตามรูปแบบไทย
          const start = event.start.dateTime || event.start.date;
          startFormatted = new Date(start).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          const end = event.end ?.dateTime || event.end ?.date || '';
          if (end) {
            endFormatted = new Date(end).toLocaleString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
          }
        }

        const location = event.location ? `📍 ${event.location}` : '';
        const desc = event.description ? `\n📝 ${event.description.substring(0, 100)}...` : '';

        embed.addFields({
          name: `🗓️ ${name}`,
          value: `🕒 ${startFormatted}${endFormatted ? ` - ${endFormatted}` : ''}\n${location}${desc}`
        });
      });


      return embed;
    };

    const getButtons = (page) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId('prev_page')
        .setLabel('⬅️ ก่อนหน้า')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),

        new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('➡️ ถัดไป')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page >= pages - 1),

        new ButtonBuilder()
        .setCustomId(`refresh_page_${interaction.user.id}`)
        .setLabel('🔄 รีเฟรช')
        .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
        .setCustomId(`close_page_${interaction.user.id}`)
        .setLabel('❌ ปิด')
        .setStyle(ButtonStyle.Danger)
      );
    };

    await interaction.reply({
      embeds: [getEmbed(currentPage)],
      components: [getButtons(currentPage)],
    });

    const reply = await interaction.fetchReply();

    const collector = reply.createMessageComponentCollector({
      time: 60_000, // 1 นาที
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: 'คุณไม่สามารถควบคุมหน้านี้ได้',
          ephemeral: true
        });
      }

      if (i.customId === `next_page_${interaction.user.id}` && currentPage < pages - 1) {
        currentPage++;
      } else if (i.customId === `prev_page_${interaction.user.id}` && currentPage > 0) {
        currentPage--;
      } else if (i.customId === `refresh_page_${interaction.user.id}`) {
        const refreshed = await fetch(url);
        const newData = await refreshed.json();
        if (!newData.items || newData.items.length === 0) {
          return i.update({
            embeds: [new EmbedBuilder().setTitle('📭 ไม่มีกิจกรรมที่กำลังจะมาถึง').setColor('Red')],
            components: []
          });
        }
        events.splice(0, events.length, ...newData.items);
        currentPage = 0;
      } else if (i.customId === `close_page_${interaction.user.id}`) {
        await i.update({
          embeds: [new EmbedBuilder().setTitle('📕 ปิดหน้ากิจกรรมแล้ว').setColor('Grey')],
          components: []
        });

        client.user.setActivity('รอรับคำสั่งจาก User', {
          type: 3
        });

        collector.stop(); // หยุดการรับ interaction
        return;
      }

      await i.update({
        embeds: [getEmbed(currentPage)],
        components: [getButtons(currentPage)],
      });
    });


    collector.on('end', async () => {
      try {
        await interaction.editReply({
          components: [], // ลบปุ่มเมื่อหมดเวลา
        });
      } catch (e) {
        console.error('ล้างปุ่มไม่สำเร็จ:', e);
      }

      // กลับสู่สถานะเดิมหลังหมดเวลา interaction
      client.user.setActivity('รอรับคำสั่งจาก User', {
        type: 3
      });
    });
  }

  

});

// Login the bot
client.login(process.env.TOKEN);
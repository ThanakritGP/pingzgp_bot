import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const CALENDAR_ID = process.env.CALENDAR_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const MAX_EVENTS_PER_PAGE = 5; // จำนวนกิจกรรมต่อหน้า

// ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย
function formatThaiDate(dateStr, isAllDay) {
  const monthNamesThai = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const date = new Date(dateStr);
  if (isAllDay) {
    return `${date.getDate()} ${monthNamesThai[date.getMonth()]} ${date.getFullYear() + 543} (ทั้งวัน)`;
  } else {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${date.getDate()} ${monthNamesThai[date.getMonth()]} ${date.getFullYear() + 543}, ${hours}:${minutes}`;
  }
}

async function fetchEvents() {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${GOOGLE_API_KEY}&timeMin=${now}&orderBy=startTime&singleEvents=true&maxResults=50`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch events from Google Calendar');
  const data = await response.json();

  return data.items || [];
}

function createEventEmbed(events, page) {
  const start = page * MAX_EVENTS_PER_PAGE;
  const selectedEvents = events.slice(start, start + MAX_EVENTS_PER_PAGE);

  const embed = new EmbedBuilder()
    .setTitle('📅 กิจกรรมจาก Google Calendar')
    .setColor('#0099ff')
    .setFooter({
      text: `หน้า ${page + 1} จาก ${Math.ceil(events.length / MAX_EVENTS_PER_PAGE)}`
    });

  if (selectedEvents.length === 0) {
    embed.setDescription('ไม่พบกิจกรรม');
  } else {
    selectedEvents.forEach((event, index) => {
      const startDate = event.start.dateTime || event.start.date;
      const isAllDay = !!event.start.date;
      const formattedDate = formatThaiDate(startDate, isAllDay);
      embed.addFields({
        name: event.summary || '(ไม่มีชื่อกิจกรรม)',
        value: `🗓️ ${formattedDate}${event.location ? `\n📌 ${event.location}` : ''}`,
        inline: false
      });
    });
  }

  return embed;
}

function createButtons(page, maxPage) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
    .setCustomId('prev_events')
    .setLabel('ก่อนหน้า')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('⬅️')
    .setDisabled(page <= 0),

    new ButtonBuilder()
    .setCustomId('next_events')
    .setLabel('ถัดไป')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('➡️')
    .setDisabled(page >= maxPage - 1),

    new ButtonBuilder()
    .setCustomId('close_events')
    .setLabel('ปิดหน้าต่าง')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('❌')
  );
}

export async function execute(interaction, client) {
  try {
    await interaction.deferReply();

    // ตั้งสถานะตอนเปิดหน้ากิจกรรม
    try {
      await client.user.setActivity('ดูกิจกรรมจาก Google Calendar', {
        type: 0
      }); // PLAYING
    } catch (err) {
      console.error('Error setting activity (start):', err);
    }

    const events = await fetchEvents();
    if (!events.length) {
      await interaction.editReply('ไม่พบกิจกรรมที่กำลังจะเกิดขึ้น');

      // ถ้าไม่มีเหตุการณ์ก็คืนสถานะเลย
      try {
        await client.user.setActivity('รอรับคำสั่งจากปิงแวรค์ซ่าๆ', {
          type: 3
        }); // WATCHING
      } catch (err) {
        console.error('Error setting activity (no events):', err);
      }

      return;
    }

    let page = 0;
    const maxPage = Math.ceil(events.length / MAX_EVENTS_PER_PAGE);

    const embed = createEventEmbed(events, page);
    const buttons = createButtons(page, maxPage);

    const message = await interaction.editReply({
      embeds: [embed],
      components: [buttons]
    });

    const collector = message.createMessageComponentCollector({
      time: 5 * 60 * 1000 // 5 นาที
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({
          content: 'คุณไม่สามารถกดปุ่มนี้ได้',
          ephemeral: true
        });
        return;
      }

      if (i.customId === 'prev_events') {
        page = Math.max(page - 1, 0);
      } else if (i.customId === 'next_events') {
        page = Math.min(page + 1, maxPage - 1);
      } else if (i.customId === 'close_events') {
        const closeEmbed = new EmbedBuilder()
        .setTitle('ปิดหน้าต่างกิจกรรมแล้ว')
        .setColor('#FF4444')
        .setTimestamp();

        await i.update({
          content: '',
          embeds: [closeEmbed],
          components: []
        });
        collector.stop(); // จะไป trigger collector.on('end')
        return;
      }

      const newEmbed = createEventEmbed(events, page);
      const newButtons = createButtons(page, maxPage);
      await i.update({
        embeds: [newEmbed],
        components: [newButtons]
      });
    });

    collector.on('end', async () => {
      // ปิดปุ่มแล้วตั้งสถานะกลับ
      await message.edit({
        components: []
      }).catch(() => {});
      try {
        await client.user.setActivity('รอรับคำสั่งจากปิงแวรค์ซ่าๆ', {
          type: 3
        }); // WATCHING
      } catch (err) {
        console.error('Error setting activity (end):', err);
      }
    });

  } catch (error) {
    console.error(error);
    await interaction.editReply('เกิดข้อผิดพลาดในการดึงกิจกรรม');

    try {
      await client.user.setActivity('รอรับคำสั่งจากปิงแวรค์ซ่าๆ', {
        type: 3
      });
    } catch (err) {
      console.error('Error setting activity (error):', err);
    }
  }
}

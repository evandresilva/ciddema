// (function() {

//     var filename = 'https://tympanus.net/codrops/adpacks/cda.css?' + new Date().getTime();
//     var fileref = document.createElement("link");
//     fileref.setAttribute("rel", "stylesheet");
//     fileref.setAttribute("type", "text/css");
//     fileref.setAttribute("href", filename);
//     document.getElementsByTagName("head")[0].appendChild(fileref);

//     let cdaSpots = ['ad1','ad3'];
//     let cdaSpot = cdaSpots[Math.floor(Math.random() * cdaSpots.length)];

//     switch (cdaSpot) {
//         case "ad1":
//             var cdaLink = 'https://ad.doubleclick.net/ddm/trackclk/N1224323.3091281BUYSELLADS/B28192607.341199479;dc_trk_aid=533247953;dc_trk_cid=174883295;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;ltd=';
//             var cdaImg = 'https://tympanus.net/codrops/wp-content/banners/mailchimp_demo.png';
//             var cdaImgAlt = 'Mailchimp';
//             var cdaText = "Sign up for Mailchimp today.";
//             break;
//         case "ad2":
//             var cdaLink = 'https://srv.buysellads.com/ads/long/x/TCLKXIZ4TTTTTTF6MGHN6TTTTTTVJ3OPKVTTTTTTK3XKBYETTTTTT242ZQQI4WZ3VHU6E74I5RSWVEIP2RQIE2D6P3WT';
//             var cdaImg = 'https://tympanus.net/codrops/wp-content/uploads/2022/07/HCA_Sidebar-260x200-1.jpg';
//             var cdaImgAlt = 'Northwestern University';
//             var cdaText = "Learn from leaders in the healthcare field in Northwestern’s Online MS in Healthcare Administration.";
//             break;
//         case "ad3":
//             var cdaLink = 'https://ad.doubleclick.net/ddm/trackclk/N718679.452584BUYSELLADS.COM/B26953268.342937760;dc_trk_aid=534766646;dc_trk_cid=175795063;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;ltd=';
//             var cdaImg = 'https://tympanus.net/codrops/wp-content/uploads/2022/08/SS.jpg';
//             var cdaImgAlt = 'Squarespace';
//             var cdaText = "Whatever your idea, you can sell it on Squarespace.";
//             break;
//         default:
//             var cdaLink = 'https://www.elegantthemes.com/affiliates/idevaffiliate.php?id=17972_5_1_16';
//             var cdaImg = 'https://tympanus.net/codrops/wp-content/banners/Divi_Carbon.jpg';
//             var cdaImgAlt = 'Divi';
//             var cdaText = "From our sponsor: Divi is more than just a WordPress theme, it's a completely new website building platform. Try it.";
//     }

//     var cda = document.createElement('div');
//     cda.id = 'cdawrap';
//     cda.style.display = 'none';
//     cda.innerHTML = '<a href="' + cdaLink + '" class="cda-img" target="_blank" rel="nofollow noopener"><img src="' + cdaImg + '" alt="' + cdaImgAlt + '" border="0" height="100" width="130"></a><a href="' + cdaLink + '" class="cda-text" target="_blank" rel="noopener">' + cdaText + '</a><div class="cda-footer"><a class="cda-poweredby" href="https://tympanus.net/codrops/advertise/" target="_blank" rel="noopener">Become a sponsor</a><button class="cda-remove" id="cda-remove">Close</button></div>';
//     document.getElementsByTagName('body')[0].appendChild(cda);

//     setTimeout(function() {
//         cda.style.display = 'block';
//     }, 1000);

//     document.getElementById('cda-remove').addEventListener('click', function(e) {
//         cda.style.display = 'none';
//         e.preventDefault();
//     });

// })();
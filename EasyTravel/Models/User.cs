using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Text;
using System.IO;
using System.Drawing.Imaging;

namespace EasyTravel.Models
{
    public class User
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Mobile { get; set; }
        public int Range { get; set; }
        public byte[] Image { get; set; }
        public string Base64
        {
            get
            {
                if (this.Image == null || this.Image.Length <= 0)
                {
                    Image defimg = Bitmap.FromFile(HttpContext.Current.Server.MapPath("~/Images/ic_user.png"));
                    MemoryStream ms = new MemoryStream();
                    defimg.Save(ms, ImageFormat.Png);
                    byte[] imageBytes = ms.ToArray();
                    return "data:image/png;base64,"+Convert.ToBase64String(imageBytes);
                }
                else
                {
                    return Encoding.Default.GetString(this.Image);
                }
            }
        }
        public string Token { get; set; }
        public static Image CropToCircle(Image srcImage, Color backGround)
        {
            Image dstImage = new Bitmap(srcImage.Width, srcImage.Height, srcImage.PixelFormat);
            Graphics g = Graphics.FromImage(dstImage);
            using (Brush br = new SolidBrush(backGround))
            {
                g.FillRectangle(br, 0, 0, dstImage.Width, dstImage.Height);
            }
            GraphicsPath path = new GraphicsPath();
            path.AddEllipse(0, 0, dstImage.Width, dstImage.Height);
            g.SetClip(path);
            g.DrawImage(srcImage, 0, 0);

            return dstImage;
        }
    }
    public class EditImage
    {
        public string ip { get; set; }
        public string Mobile { get; set; }
        public string Image { get; set; }
    }
    public class EditPassword
    {
        public string ip { get; set; }
        public string Mobile { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
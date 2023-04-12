import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as fs from "fs";
import * as path from "path";

const isUrlValid = (url: string) => {
  // Regular expression for checking if the url is valid
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
};

@Injectable()
export class ImgTransferService {
  constructor(private prismaService: PrismaService) {}

  async updateProfilePic(userName: string, data: any): Promise<string> {
    const users = this.prismaService.GetProfile({ username: userName });
    const imageUrl = (await users).avatar;
    console.log("URL: " + imageUrl);
    if (isUrlValid(imageUrl)) {
      const filename = path.basename(imageUrl);
      const imagePath = "../../img/" + filename;
      const imgPth = path
        .join(__dirname, "/img", path.basename(imageUrl))
        .replace("/dist/src/imgtransfer", "");
      const relativePath = imagePath.replace(/.*\/dist\//, "");
      fs.unlinkSync(imgPth);
    }
    this.prismaService.updateAvatar(userName, data.URL);
    return;
  }
}

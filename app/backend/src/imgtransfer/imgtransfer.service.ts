import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as fs from "fs";
import * as path from "path";
import { dataTransfer } from "./dto/imgtransfer.dto";

const logger = new Logger("ImgTransferService");

const isUrlValid = (url: string) => {
  // Regular expression for checking if the url is valid
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
};

@Injectable()
export class ImgTransferService {
  constructor(private prismaService: PrismaService) {}

  async updateProfilePic(
    userName: string,
    data: dataTransfer
  ): Promise<string> {
    const users = this.prismaService.GetProfile({ username: userName });
    const imageUrl = (await users).avatar;
    logger.log("URL: " + imageUrl);
    if (isUrlValid(imageUrl)) {
      const imgPth = path
        .join(__dirname, "/img", path.basename(imageUrl))
        .replace("/dist/src/imgtransfer", "");
      if (fs.existsSync(imgPth)) fs.unlinkSync(imgPth);
    }
    this.prismaService.updateAvatar(userName, data.URL);
    return;
  }
}

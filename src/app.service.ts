import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
@Injectable()
export class AppService {
  private readonly apiKey = process.env.TMDB_API_KEY;
  private readonly apiBaseUrl = process.env.TMDB_API_URL;

  async getPopularMoviesPdf(): Promise<Uint8Array> {
    const response = await axios.get(`${this.apiBaseUrl}/movie/popular`, {
      params: { api_key: this.apiKey },
    });

    const movies = response.data.results;
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const page = pdfDoc.addPage([600, 600]);
    const { height } = page.getSize();

    page.drawText('Popular Movies', {
      x: 50,
      y: height - 50,
      size: 30,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    let yPosition = height - 100;
    movies.forEach((movie: any, index: number) => {
      const text = `${index + 1}. id: ${movie.id} Title: ${movie.title} (Release Date: ${movie.release_date}, Rating: ${movie.vote_average})`;
      page.drawText(text, {
        x: 50,
        y: yPosition,
        size: 12,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    });
    return await pdfDoc.save();
  }

  async getMovieById(id: string): Promise<Uint8Array> {
    const response = await axios.get(`${this.apiBaseUrl}/movie/${id}`, {
      params: { api_key: this.apiKey },
    });

    const movie = response.data;
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const page = pdfDoc.addPage([600, 600]);
    const { height } = page.getSize();

    page.drawText(movie.title, {
      x: 50,
      y: height - 50,
      size: 30,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Release Date: ${movie.release_date}`, {
      x: 50,
      y: height - 100,
      size: 15,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Rating: ${movie.vote_average}`, {
      x: 50,
      y: height - 130,
      size: 15,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    const posterImageBytes = await axios.get(posterUrl, {
      responseType: 'arraybuffer',
    });
    const posterImage = await pdfDoc.embedJpg(posterImageBytes.data);
    page.drawImage(posterImage, {
      x: 50,
      y: height - 500,
      width: 200,
      height: 300,
    });

    return pdfDoc.save();
  }
}

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type Movie = {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
};

type MoviesResponse = {
  results: Movie[];
};

@Injectable()
export class AppService {
  private readonly apiKey = process.env.TMDB_API_KEY;
  private readonly apiBaseUrl = process.env.TMDB_API_URL;
  private readonly logger = new Logger(AppService.name);

  async getPopularMoviesPdf(): Promise<Uint8Array> {
    try {
      const movies = await this.fetchPopularMovies();
      const pdfBytes = await this.generateMoviesPdf(movies);
      return pdfBytes;
    } catch (error) {
      this.logger.error('Failed to generate popular movies PDF', error);
      throw new InternalServerErrorException('Could not generate PDF');
    }
  }

  async getMovieByIdPdf(id: string): Promise<Uint8Array> {
    try {
      const movie = await this.fetchMovieById(id);
      const pdfBytes = await this.generateMoviePdf(movie);
      return pdfBytes;
    } catch (error) {
      this.logger.error(`Failed to generate PDF for movie ID: ${id}`, error);
      throw new InternalServerErrorException('Could not generate PDF');
    }
  }

  private async fetchPopularMovies(): Promise<Movie[]> {
    const response: AxiosResponse<MoviesResponse> = await axios.get(
      `${this.apiBaseUrl}/movie/popular`,
      {
        params: { api_key: this.apiKey },
      },
    );
    return response.data.results;
  }

  private async fetchMovieById(id: string): Promise<Movie> {
    const response: AxiosResponse<Movie> = await axios.get(
      `${this.apiBaseUrl}/movie/${id}`,
      {
        params: { api_key: this.apiKey },
      },
    );
    return response.data;
  }

  private async generateMoviesPdf(movies: Movie[]): Promise<Uint8Array> {
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
    movies.forEach((movie: Movie, index: number) => {
      const text = `${index + 1}. Id: ${movie.id}, Title: ${movie.title}, Release Date: ${movie.release_date}, Rating: ${movie.vote_average}`;
      page.drawText(text, {
        x: 50,
        y: yPosition,
        size: 12,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    });

    return pdfDoc.save();
  }
  private async generateMoviePdf(movie: Movie): Promise<Uint8Array> {
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

    if (movie.poster_path) {
      const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      const posterImageBytes = await this.downloadImage(posterUrl);
      const posterImage = await pdfDoc.embedJpg(posterImageBytes);
      page.drawImage(posterImage, {
        x: 50,
        y: height - 500,
        width: 200,
        height: 300,
      });
    }

    return pdfDoc.save();
  }

  private async downloadImage(url: string): Promise<Uint8Array> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return response.data;
  }
}

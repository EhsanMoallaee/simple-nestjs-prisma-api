import { Controller, UseGuards, Post, Get, Patch, Delete, Param, ParseIntPipe, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {

    constructor( private readonly bookmarkService: BookmarkService) {}

    @Post()
    createBookmark(
        @GetUser('id') userId: number,
        @Body() dto: CreateBookmarkDto
    ) {
        return this.bookmarkService.createBookmark(userId, dto);
    }
    
    @Get()
    getBookmarks(@GetUser('id') userId: number) {
        return this.bookmarkService.getBookmarks(userId);
    }
    
    @Get(':id')
    getBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number
    ) {
        return this.bookmarkService.getBookmarkById(userId, bookmarkId)
    }
    
    @Patch(':id')
    editBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
        @Body() dto: EditBookmarkDto
    ) {
        return this.bookmarkService.editBookmarkById(userId, bookmarkId, dto);
    }
    
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number
    ) {
        return this.bookmarkService.delteBookmarkById(userId, bookmarkId);
    }
}
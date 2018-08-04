import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import $ = require('jquery');

import { Sequence, SequenceDrawer, SequenceDrawerOptions } from './sequenceDrawer';

function recaman(n: number, negFunc: (prev: number, i: number) => number, posFunc: (prev: number, i: number) => number) {
    let seq: number[] = [1];
    let used: any = { 1: true };
    let max: number = 1;

    for (var i = 2; i <= n; i++) {
        let prev = seq[i - 2];
        let neg = negFunc(prev, i);

        if (!used[neg] && neg > 0) {
            seq.push(neg);
            used[neg] = true;
        } else {
            let pos = posFunc(prev, i);
            seq.push(pos);
            used[pos] = true;

            if (pos > max) {
                max = pos;
            }
        }
    }

    return {
        max: max,
        elements: seq
    };
}

function resizeCanvas()
{
    let c = document.getElementById("recaman") as HTMLCanvasElement;    
    c.width  = $('#main-container').innerWidth() - 60;
    c.height = window.innerHeight * .9;
}

$(function () {
    
    let $sequenceLength = $('#sequenceLength');
    let $framesPerElem = $('#framesPerElem');
    
    // initial values
    $sequenceLength.val(100);
    $framesPerElem.val(15);

    $('#startButton').on('click', () => {
        
        let seq = recaman($sequenceLength.val() as number, (prev, i) => { return prev - i; }, (prev, i) => { return prev + i; });

        let c = document.getElementById("recaman") as HTMLCanvasElement;
        var drawer = new SequenceDrawer(c);    
    
        let drawOptions: SequenceDrawerOptions = {
            framesPerElem: $framesPerElem.val() as number,
            currentStepCallback: (step: number) => { $('#currentStep').text(step); }
        }
    
        drawer.drawSequence(seq, drawOptions);

        let $sequenceValues = $('#sequenceValues');
        for(let i = 0; i < seq.elements.length; i++) {
            $sequenceValues.text($sequenceValues.text() +  ' ' + seq.elements[i]);
        }
    });
       
    resizeCanvas();

    $(window).on('resize', function () {
        resizeCanvas();
    })
});
